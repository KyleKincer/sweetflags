import FeatureFlag from '../models/FeatureFlagModel';
import { IFeatureFlag, IFeatureFlagInputDTO, IFeatureFlagUpdateDTO } from '../interfaces/IFeatureFlag';
import { isIFeatureFlag, isIFeatureFlagArray } from '../type-guards/IFeatureFlag';
import Environment from '../models/EnvironmentModel';
import App from '../models/AppModel';
import { FlagNotFoundError, AppNotFoundError, EnvironmentNotFoundError } from '../errors';
import md5 from 'md5';
import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

class FeatureFlagService {
    async getAllFlags(): Promise<Array<IFeatureFlag>> {
        let featureFlagDocs = await
            FeatureFlag.find()
                .populate('environments.environment')
                .populate('app')
                .populate('environments.allowedUsers')
                .populate('environments.disallowedUsers')
                .exec();
        if (!featureFlagDocs) {
            throw new FlagNotFoundError('No flags found');
        }

        const featureFlags = featureFlagDocs.map((flag) => {
            flag = flag.toObject();
            return flag;
        });

        if (!isIFeatureFlagArray(featureFlags)) {
            throw new Error('Invalid flags');
        }
        return featureFlags;
    }

    async getFlagById(id: string): Promise<IFeatureFlag> {
        const featureFlagDoc = await
            FeatureFlag.findById(id)
                .populate('environments.environment')
                .populate('environments.allowedUsers')
                .populate('environments.disallowedUsers')
                .populate('app')
                .exec();

        if (!featureFlagDoc) {
            throw new FlagNotFoundError(`Flag '${id}' not found`);
        }

        const featureFlag = featureFlagDoc.toObject();
        if (!isIFeatureFlag(featureFlag)) {
            throw new Error('Invalid flag');
        }
        return featureFlag;
    }

    async getFlagByName(name: string): Promise<IFeatureFlag> {
        const featureFlagDoc = await
            FeatureFlag.findOne({ name: name })
                .populate('environments.environment')
                .populate('environments.allowedUsers')
                .populate('environments.disallowedUsers')
                .populate('app')
                .exec();
        if (!featureFlagDoc) {
            throw new FlagNotFoundError(`Flag '${name}' not found`);
        }

        const featureFlag = featureFlagDoc.toObject();
        if (!isIFeatureFlag(featureFlag)) {
            throw new Error('Invalid flag');
        }
        return featureFlag;
    }

    async getFlagsByAppId(appId: string): Promise<Array<IFeatureFlag>> {
        const app = await App.findById(appId);
        if (!app) {
            throw new AppNotFoundError(`App '${appId}' not found`);
        }
        let featureFlagDocs = await
            FeatureFlag.find({ app: app._id })
                .populate('environments.environment')
                .populate('environments.allowedUsers')
                .populate('environments.disallowedUsers')
                .populate('app')
                .exec();
        if (!featureFlagDocs) {
            throw new FlagNotFoundError(`No flags found for app '${appId}'`);
        }

        const featureFlags = featureFlagDocs.map((flag) => {
            flag = flag.toObject();
            return flag;
        });

        if (!isIFeatureFlagArray(featureFlags)) {
            throw new Error('Invalid flags');
        }

        return featureFlags;
    }

    async getFlagsByAppName(appName: string): Promise<Array<IFeatureFlag>> {
        const app = await App.findOne({ name: appName });
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }
        let featureFlagDocs = await
            FeatureFlag.find({ app: app._id })
                .populate('environments.environment')
                .populate('environments.allowedUsers')
                .populate('environments.disallowedUsers')
                .populate('app')
                .exec();
        if (!featureFlagDocs) {
            throw new FlagNotFoundError(`No flags found for app '${appName}'`);
        }

        const featureFlags = featureFlagDocs.map((flag) => {
            flag = flag.toObject();
            return flag;
        });

        if (!isIFeatureFlagArray(featureFlags)) {
            throw new Error('Invalid flags');
        }
        return featureFlags;
    }

    async getFlagState(flagName: string | undefined, flagId: string | undefined, appName: string, userId: string, environmentName: string): Promise<boolean> {
        const app = await App.findOne({ name: appName });
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }

        let featureFlagDoc: (Document & IFeatureFlag) | null;
        if (flagId) {
            featureFlagDoc = await FeatureFlag.findById(flagId).exec();
        } else if (flagName) {
            featureFlagDoc = await FeatureFlag.findOne({ app: app._id, name: flagName }).exec();
        } else {
            throw new FlagNotFoundError(`Either the id or name property is required`);
        }

        if (!featureFlagDoc) {
            throw new FlagNotFoundError(`Flag '${flagName}' not found`);
        }

        return await this.isEnabled(featureFlagDoc, userId, environmentName);
    }

    async getFlagStatesForUserId(appName: string, userId: string, environmentName: string): Promise<Array<{ name: string; isEnabled: boolean }>> {
        const app = await App.findOne({ name: appName });
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }

        const featureFlags = await FeatureFlag.find({ app: app._id }).exec();

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

        let featureFlagDoc: IFeatureFlag | null = new FeatureFlag();
        if (id) {
            featureFlagDoc = await FeatureFlag.findOne({ app: app._id, _id: id }).exec();
        } else if (flagName) {
            featureFlagDoc = await FeatureFlag.findOne({ app: app._id, name: flagName }).exec();
        } else {
            throw new FlagNotFoundError(`Either the id or name property is required`);
        }

        if (!featureFlagDoc) {
            throw new FlagNotFoundError(`Flag '${id || flagName}' not found`);
        }

        const environments = featureFlagDoc.environments;
        const environmentIndex = environments.findIndex(e => e.environment.toString() === environment._id.toString());
        if (environmentIndex === -1) {
            throw new FlagNotFoundError(`Flag ${id || flagName} does not exist for environment ${environment._id}`);
        } else {
            environments[environmentIndex].isActive = !environments[environmentIndex].isActive;
            featureFlagDoc.environments = environments;
            await featureFlagDoc.save();
            await featureFlagDoc.populate('app');
            await featureFlagDoc.populate('environments.environment');
            await featureFlagDoc.populate('environments.allowedUsers');
            await featureFlagDoc.populate('environments.disallowedUsers');
            const featureFlag = featureFlagDoc.toObject();
            if (!isIFeatureFlag(featureFlag)) {
                throw new Error('Invalid flag');
            }
            return featureFlag;
        }
    }

    async updateFlagMetadata(id: string, name?: string, description?: string, app?: string, updatedBy?: string): Promise<IFeatureFlag> {
        const featureFlagDoc = await FeatureFlag.findByIdAndUpdate(id, { name: name, description: description, app: app, updatedBy: updatedBy }, { new: true }).exec();
        if (!featureFlagDoc) {
            throw new FlagNotFoundError(`Flag '${id}' not found`);
        }
        await featureFlagDoc.populate('app');
        await featureFlagDoc.populate('environments.environment');
        await featureFlagDoc.populate('environments.allowedUsers');
        await featureFlagDoc.populate('environments.disallowedUsers');

        const featureFlag = featureFlagDoc.toObject();
        if (!isIFeatureFlag(featureFlag)) {
            throw new Error('Invalid flag');
        }
        return featureFlag;
    }

    async updateFlag(id: String, data: IFeatureFlagUpdateDTO): Promise<IFeatureFlag> {
        const { environmentId, isActive, updatedBy, evaluationStrategy, evaluationPercentage, allowedUsers, disallowedUsers } = data;
        const featureFlagDoc = await FeatureFlag.findById(id).exec();
        if (!featureFlagDoc) {
            throw new FlagNotFoundError(`Flag '${id}' not found`);
        }
        
        const environments = featureFlagDoc.environments;
        const environmentIndex = environments.findIndex(e => e.environment.toString() === environmentId);
        if (environmentIndex === -1) {
            throw new EnvironmentNotFoundError(`Environment ${environmentId} not found`);
        }

        environments[environmentIndex].isActive = typeof isActive === 'undefined' ? environments[environmentIndex].isActive : isActive;
        environments[environmentIndex].evaluationStrategy = typeof evaluationStrategy === 'undefined' ? environments[environmentIndex].evaluationStrategy : evaluationStrategy;
        environments[environmentIndex].evaluationPercentage = typeof evaluationPercentage === 'undefined' ? environments[environmentIndex].evaluationPercentage : evaluationPercentage;
        environments[environmentIndex].allowedUsers = typeof allowedUsers === 'undefined' ? environments[environmentIndex].allowedUsers : allowedUsers;
        environments[environmentIndex].disallowedUsers = typeof disallowedUsers === 'undefined' ? environments[environmentIndex].disallowedUsers : disallowedUsers;
        environments[environmentIndex].updatedBy = updatedBy;

        featureFlagDoc.environments = environments;
        await featureFlagDoc.save();
        await featureFlagDoc.populate('app');
        await featureFlagDoc.populate('environments.environment');
        await featureFlagDoc.populate('environments.allowedUsers');
        await featureFlagDoc.populate('environments.disallowedUsers');
        const featureFlag = featureFlagDoc.toObject();
        if (!isIFeatureFlag(featureFlag)) {
            throw new Error('Invalid flag');
        }
        return featureFlag;
    }

    async createFlag(data: IFeatureFlagInputDTO): Promise<IFeatureFlag> {
        const { name, appId, isActive, createdBy, description, evaluationStrategy, evaluationPercentage, allowedUsers, disallowedUsers } = data;

        const app = await App.findById(appId).exec();
        if (!app) {
            throw new AppNotFoundError(`App with ID '${appId}' not found`);
        }

        const environments = await Environment.find({ app: app._id }).exec();
        if (!environments) {
            throw new EnvironmentNotFoundError(`No environments found for app with ID '${appId}'`);
        }

        const environmentsArray = environments.map((env) => ({
            environment: env._id,
            isActive: isActive,
            evaluationStrategy: evaluationStrategy || 'BOOLEAN',
            evaluationPercentage: evaluationPercentage || 0,
            allowedUsers: allowedUsers || [],
            disallowedUsers: disallowedUsers || []
        }));

        const featureFlagDoc = new FeatureFlag({
            name: name,
            description: description || '',
            app: app._id,
            environments: environmentsArray,
            createdBy: createdBy
        });

        await featureFlagDoc.save();
        await featureFlagDoc.populate('app');
        await featureFlagDoc.populate('environments.environment');
        await featureFlagDoc.populate('environments.allowedUsers');
        await featureFlagDoc.populate('environments.disallowedUsers');
        const featureFlag = featureFlagDoc.toObject();
        if (!isIFeatureFlag(featureFlag)) {
            throw new Error('Invalid flag');
        }

        return featureFlag;
    }

    async deleteFlag(id: string): Promise<IFeatureFlag> {
        const featureFlagDoc = await FeatureFlag.findByIdAndDelete(id).exec();
        if (!featureFlagDoc) {
            throw new FlagNotFoundError(`Flag '${id}' not found`);
        }
        await featureFlagDoc.populate('app');
        await featureFlagDoc.populate('environments.environment');
        await featureFlagDoc.populate('environments.allowedUsers');
        await featureFlagDoc.populate('environments.disallowedUsers');
        const featureFlag = featureFlagDoc.toObject();
        if (!isIFeatureFlag(featureFlag)) {
            throw new Error('Invalid flag');
        }
        return featureFlag;
    }


    async isEnabled(featureFlag: IFeatureFlag, user: string, environment: string): Promise<boolean> {
        let environmentDoc = await Environment.findOne({ name: environment, app: featureFlag.app }).exec();

        if (!environmentDoc) {
            // Default to production
            environmentDoc = await Environment.findOne({ flagName: "Production" }).exec();
            if (!environmentDoc) {
                return false;
            }
        }

        const flagData = featureFlag.environments.find((env) => env.environment.toString() === environmentDoc!._id.toString());
        if (!flagData) {
            return false;
        }

        switch (flagData.evaluationStrategy) {
            case 'BOOLEAN':
                return flagData.isActive;

            case 'USER':
                const userId = new ObjectId(user);

                // If there is nothing in either of these arrays, then we can't evaluate the flag
                if (!flagData.allowedUsers || !flagData.disallowedUsers) {
                    return false;
                }
                // Allowed users take precedence over disallowed users
                return (
                    flagData.isActive &&
                    (flagData.allowedUsers.some(allowedUser => allowedUser.equals(userId)) || !flagData.disallowedUsers.some(disallowedUser => disallowedUser.equals(userId)))
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

