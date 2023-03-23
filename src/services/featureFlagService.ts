import FeatureFlag, { IFeatureFlag } from '../models/FeatureFlagModel';
import Environment from '../models/EnvironmentModel';
import App from '../models/AppModel';
import { FlagNotFoundError, AppNotFoundError, EnvironmentNotFoundError } from '../errors';
import RedisCache from '../redis';
import md5 from 'md5';

class FeatureFlagService {
    async getAllFlags(): Promise<Array<IFeatureFlag>> {
        const featureFlags = await FeatureFlag.find().populate('environments.environment').exec();
        if (!featureFlags) {
            throw new FlagNotFoundError('No flags found');
        }
        // Cache the result
        RedisCache.setCacheForFeatureFlags(featureFlags);
        return featureFlags;
    }

    async getFlagById(id: string): Promise<IFeatureFlag> {
        // Try to get the flag from the cache
        const cachedData = await RedisCache.getFeatureFlag({id: id});
        if (cachedData) {
            // If it's in the cache return it
            console.log('Cache hit');
            return cachedData;
        } else {
            // If not, query the database
            const featureFlag = await FeatureFlag.findById(id).populate('environments.environment').exec();
            if (!featureFlag) {
                throw new FlagNotFoundError(`Flag '${id}' not found`);
            }
            // Cache the result
            RedisCache.setCacheForFeatureFlag(featureFlag);
            return featureFlag;
        }
    }

    async getFlagByName(name: string): Promise<IFeatureFlag> {
        // Try to get the flag from the cache
        const cachedData = await RedisCache.getFeatureFlag({name: name})
        if (cachedData) {
            // If it's in the cache return it
            console.log('Cache hit');
            return cachedData;
        } else {
            const featureFlag = await FeatureFlag.findOne({ name: name }).populate('environments.environment').exec();
            if (!featureFlag) {
                throw new FlagNotFoundError(`Flag '${name}' not found`);
            }
            // Cache the result
            RedisCache.setCacheForFeatureFlag(featureFlag);
            return featureFlag;
        }
    }

    async getFlagsByAppName(appName: string): Promise<Array<IFeatureFlag>> {
        // Try to get the flags from the cache
        const cachedData = await RedisCache.getFeatureFlagsByAppName(appName);
        if (cachedData) {
            console.log('Cache hit');
            return cachedData;
        }
        const app = await App.findOne({ name: appName });
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }
        const featureFlags =  await FeatureFlag.find({ app: app._id }).populate('environments.environment').exec();
        if (!featureFlags) {
            throw new FlagNotFoundError(`No flags found for app '${appName}'`);
        }
        // Cache the result
        RedisCache.setCacheForFeatureFlagsByAppName(featureFlags, appName);
        return featureFlags;
    }

    async getFlagStateForName(flagName: string, appName: string, userId: string, environmentName: string): Promise<boolean> {
        const cachedData = await RedisCache.getFeatureFlag({name: flagName});
        if (cachedData) {
            console.log('Cache hit');
            return await this.isEnabled(cachedData, userId, environmentName);
        }
        const app = await App.findOne({ name: appName });
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }

        const featureFlag = await FeatureFlag.findOne({ app: app._id, name: flagName }).exec();
        if (!featureFlag) {
            throw new FlagNotFoundError(`Flag '${flagName}' not found`);
        }
        RedisCache.setCacheForFeatureFlag(featureFlag);
        return await this.isEnabled(featureFlag, userId, environmentName);
    }

    async getFlagStatesForUserId(appName: string, userId: string, environmentName: string): Promise<Array<{ name: string; isEnabled: boolean }>> {
        const cachedData = await RedisCache.getFeatureFlagsByUserId(appName, userId)
        if (cachedData) {
            return this.areEnabled(cachedData, userId, environmentName)
        }
        const app = await App.findOne({ name: appName });
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }

        const featureFlags = await FeatureFlag.find({ app: app._id }).exec();
        RedisCache.setCacheForFeatureFlagsByUserId(featureFlags, appName, userId);

        return this.areEnabled(featureFlags, userId, environmentName);
    }

    async toggleFlag(flagName: string, id: string, appName: string, environmentName: string): Promise<IFeatureFlag> {
        const app = await App.findOne({ name: appName }).exec();
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }

        const environment = await Environment.findOne({ app: app._id, name: environmentName }).exec();
        if (!environment) {
            throw new EnvironmentNotFoundError(`Environment '${environmentName}' not found`);
        }

        let featureFlag = await RedisCache.getFeatureFlag({id: id, name: flagName})
        if (!featureFlag && id) {
            featureFlag = await FeatureFlag.findOne({ app: app._id, _id: id }).populate('environments.environment', 'app').exec();
        } else if (flagName) {
            featureFlag = await FeatureFlag.findOne({ app: app._id, name: flagName }).populate('environments.environment', 'app').exec();
        } else {
            throw new FlagNotFoundError(`Either the id or name property is required`);
        }

        if (!featureFlag) {
            throw new FlagNotFoundError(`Flag '${id || flagName}' not found`);
        } 

        const environments = featureFlag.environments;
        const environmentIndex = environments.findIndex(e => e.environment._id.toString() === environment._id.toString());
        if (environmentIndex === -1) {
            throw new FlagNotFoundError(`Flag ${id || flagName} does not exist for environment ${environment._id}`);
        } else {
            environments[environmentIndex].isActive = !environments[environmentIndex].isActive;
            featureFlag.environments = environments;
            await featureFlag.save();
            // invalidate cache
            RedisCache.deleteCacheForFeatureFlag(featureFlag);
            return featureFlag;
        }
    }

    async createFlag(name: string, description: string, appName: string, isActive: boolean, evaluationStrategy: string, evaluationPercentage: number, allowedUsers: Array<string>, disallowedUsers: Array<string>, createdBy: string): Promise<IFeatureFlag> {
        const app = await App.findOne({ name: appName }).exec();
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }

        const environments = await Environment.find({ app: app._id }).exec();
        if (!environments) {
            throw new EnvironmentNotFoundError(`No environments found for app '${appName}'`);
        }

        const environmentsArray = environments.map((env) => ({
            environment: env._id,
            isActive: isActive,
            evaluationStrategy: evaluationStrategy,
            evaluationPercentage: evaluationPercentage,
            allowedUsers: allowedUsers,
            disallowedUsers: disallowedUsers
        }));

        const featureFlag = new FeatureFlag({
            name: name,
            description: description,
            app: app._id,
            environments: environmentsArray,
            createdBy: createdBy
        });

        await featureFlag.save();
        // Update the cache
        // Need to run delete first to invalidate other caches that this updates the results of
        // await to avoid race condition modifying the same cache keys
        await RedisCache.deleteCacheForFeatureFlag(featureFlag)
        RedisCache.setCacheForFeatureFlag(featureFlag);
        return featureFlag;
    }

    async isEnabled(featureFlag: IFeatureFlag, user: string, environment: string): Promise<boolean> {
        let environmentData = await Environment.findOne({ flagName: environment, app: featureFlag.app }).exec();

        if (!environmentData) {
            // Default to production
            environmentData = await Environment.findOne({ flagName: "Production" }).exec();
            if (!environmentData) {
                return false;
            }
        }

        const flagData = featureFlag.environments.find((env) => env.environment.toString() === environmentData!._id.toString());
        if (!flagData) {
            return false;
        }

        switch (flagData.evaluationStrategy) {
            case 'BOOLEAN':
                return flagData.isActive;

            case 'USER':
                // If there is nothing in either of these arrays, then we can't evaluate the flag
                if (!flagData.allowedUsers || !flagData.disallowedUsers) {
                    return false;
                }
                // Allowed users take precedence over disallowed users
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
            
            // Probabalistic is random
            case 'PROBABALISTIC':
                const probabalisticPercentage = flagData.evaluationPercentage || 0;
                return Math.random() * 100 <= probabalisticPercentage;

            default:
                return false;
        }
    }

    async areEnabled(featureFlags: Array<IFeatureFlag>, user: string, environment: string): Promise<Array<{ name: string; isEnabled: boolean }>> {
        const promises = featureFlags.map(async (flag) => {
            return {
                name: flag.name,
                isEnabled: await this.isEnabled(flag, user, environment)
            };
        });
        return await Promise.all(promises);
    }
}

export default new FeatureFlagService();

