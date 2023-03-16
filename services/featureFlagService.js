const FeatureFlag = require('../models/FeatureFlagModel');
const Environment = require('../models/EnvironmentModel');
const App = require('../models/AppModel');
const { FlagNotFoundError, AppNotFoundError, EnvironmentNotFoundError } = require('../errors');
const md5 = require('md5');

class FeatureFlagService {
    async getAllFlags() {
        const featureFlags = await FeatureFlag.find().populate('environments.environment').exec();
        if (!featureFlags) {
            throw new FlagNotFoundError('No flags found');
        }
        return featureFlags;
    }

    async getFlagById(id) {
        const featureFlag = await FeatureFlag.findById(id).populate('environments.environment').exec();
        if (!featureFlag) {
            throw new FlagNotFoundError(`Flag '${id}' not found`);
        }
        return featureFlag;
    }

    async getFlagByName(name) {
        const featureFlag = FeatureFlag.find({ name: name }).populate('environments.environment').exec();
        if (!featureFlag) {
            throw new FlagNotFoundError(`Flag '${name}' not found`);
        }
        return featureFlag;
    }

    async getFlagsByAppName(appName) {
        const app = await App.findOne({ name: appName });
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }
        return await FeatureFlag.find({ app: app._id }).populate('environments.environment').exec();
    }

    async getFlagStateForName(flagName, appName, userId, environmentName) {
        const app = await App.findOne({ name: appName });
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }

        const featureFlag = await FeatureFlag.findOne({ app: app._id, name: flagName }).exec();
        if (!featureFlag) {
            throw new FlagNotFoundError(`Flag '${flagName}' not found`);
        }

        return await this.isEnabled(featureFlag, userId, environmentName);
    }

    async getFlagStatesForUserId(appName, userId, environmentName) {
        const app = await App.findOne({ name: appName });
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }

        const featureFlags = await FeatureFlag.find({ app: app._id }).exec();

        return this.areEnabled(featureFlags, userId, environmentName);
    }

    async toggleFlag(flagName, id, appName, environmentName) {
        const app = await App.findOne({ name: appName }).exec();
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }

        const environment = await Environment.findOne({ app: app._id, name: environmentName }).exec();
        if (!environment) {
            throw new EnvironmentNotFoundError(`Environment '${environmentName}' not found`);
        }

        let featureFlag = {};
        if (id) {
            featureFlag = await FeatureFlag.findOne({ app: app._id, _id: id }).exec();
        } else if (flagName) {
            featureFlag = await FeatureFlag.findOne({ app: app._id, name: flagName }).exec();
        } else {
            throw new FlagNotFoundError(`Either the id or name property is required`);
        }

        if (!featureFlag) {
            throw new FlagNotFoundError(`Flag '${id || flagName}' not found`);
        }

        const environments = featureFlag.environments;
        const environmentIndex = environments.findIndex(e => e.environment.toString() === environment._id.toString());
        if (environmentIndex === -1) {
            throw new FlagNotFoundError(`Flag ${id || flagName} does not exist for environment ${environment._id}`);
        } else {
            environments[environmentIndex].isActive = !environments[environmentIndex].isActive;
            featureFlag.environments = environments;
            await featureFlag.save();
            return featureFlag;
        }
    }

    async createFlag(name, description, appName, isActive, evaluationStrategy, evaluationPercentage, allowedUsers, disallowedUsers, createdBy) {
        const app = await App.findOne({ name: appName }).exec();
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }

        const environments = await Environment.find({ app: app._id }).exec();
        if (!environments) {
            throw new EnvironmentNotFoundError(`No environments found for app '${appName}'`);
        }

        const environmentsArray = []
        environments.forEach((env) => {
            environmentsArray.push({
                environment: env._id,
                isActive: isActive,
                evaluationStrategy: evaluationStrategy,
                evaluationPercentage: evaluationPercentage,
                allowedUsers: allowedUsers,
                disallowedUsers: disallowedUsers
            });
        });

        const featureFlag = new FeatureFlag({
            name: name,
            description: description,
            app: app._id,
            environments: environmentsArray,
            createdBy: createdBy
        });

        await featureFlag.save();
        return featureFlag;
    }

    async isEnabled(featureFlag, user, environment) {

        let environmentData = await Environment.findOne({ flagName: environment, app: featureFlag.app }).exec()

        if (!environmentData) {
            // Default to production
            environmentData = await Environment.findOne({ flagName: "Production" }).exec()
            if (!environmentData) {
                return false;
            }
        }

        const flagData = featureFlag.environments.find((env) => env.environment.toString() === environmentData._id.toString());
        switch (flagData.evaluationStrategy) {
            case 'IMMEDIATE':
                return flagData.isActive;

            case 'USER':
                return (
                    flagData.isActive &&
                    (flagData.allowedUsers.includes(user) || !flagData.disallowedUsers.includes(user))
                );

            // Percentage is deterministic based on the user id  
            case 'PERCENTAGE':
                const percentage = flagData.evaluationPercentage || 0;
                const hash = md5(user);
                const hashInt = parseInt(hash.substr(0, 8), 16);
                const normalized = hashInt / 0xffffffff;

                // multiply by 100 to get a percentage value
                const userPercentage = normalized * 100;
                return userPercentage <= percentage;

            case 'PROBABALISTIC':
                const probabalisticPercentage = flagData.evaluationPercentage || 0;
                return Math.random() * 100 <= probabalisticPercentage;


            default:
                return false;
        }
    }

    async areEnabled(featureFlags, user, environment) {
        const promise = featureFlags.map(async (flag) => {
            return {
                name: flag.name,
                isEnabled: await this.isEnabled(flag, user, environment)
            };
        })
        return await Promise.all(promise);
    }

}

module.exports = new FeatureFlagService();