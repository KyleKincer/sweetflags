import App from '../models/AppModel';
import Environment from '../models/EnvironmentModel';
import FeatureFlag from '../models/FeatureFlagModel';
import { IEnvironment } from '../interfaces/IEnvironment';
import { AppNotFoundError, EnvironmentNotFoundError } from '../errors';
import { isIEnvironment, isIEnvironmentArray } from '../type-guards/IEnvironment';
import RedisCache from '../redis'

class EnvironmentsService {
    async getAllEnvironments(): Promise<Array<IEnvironment>> {
        const environmentsDocs = await Environment.find().populate('app').exec();
        if (!environmentsDocs) {
            throw new EnvironmentNotFoundError('No environments found');
        }

        const environments = environmentsDocs.map((environment) => {
            return environment.toObject();
        });

        if (!isIEnvironmentArray(environments)) {
            throw new Error('Invalid environment data');
        }

        return environments;
    }

    async getEnvironmentById(id: string): Promise<IEnvironment> {
        const environmentDoc = await Environment.findById(id).populate('app').exec();
        if (!environmentDoc) {
            throw new EnvironmentNotFoundError(`Environment '${id}' not found`);
        }

        const environment = environmentDoc.toObject();
        if (!isIEnvironment(environment)) {
            throw new Error('Invalid environment data');
        }

        return environment;
    }

    async getEnvironmentsByAppId(appId: string): Promise<{ environments: IEnvironment[] }> {
        const appDoc = await App.findById(appId).exec();
        if (!appDoc) {
            throw new AppNotFoundError(`App '${appId}' not found`);
        }
        const environmentDocs = await Environment.find({ app: appDoc._id }).populate('app').exec();
        if (!environmentDocs) {
            throw new EnvironmentNotFoundError(`No environments found for app '${appId}'`);
        }

        const environments = environmentDocs.map((environment) => {
            return environment.toObject();
        });

        if (!isIEnvironmentArray(environments)) {
            throw new Error('Invalid environment data');
        }

        return {
            environments: environments,
        }
    }

    async getEnvironmentsByAppName(appName: string): Promise<Array<IEnvironment>> {
        const appDoc = await App.findOne({ name: appName }).exec();
        if (!appDoc) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }
        const environmentDocs = await Environment.find({ app: appDoc._id }).populate('app').exec();
        if (!environmentDocs) {
            throw new EnvironmentNotFoundError(`No environments found for app '${appName}'`);
        }

        const environments = environmentDocs.map((environment) => {
            return environment.toObject();
        });

        if (!isIEnvironmentArray(environments)) {
            throw new Error('Invalid environment data');
        }

        return environments;
    }

    async createEnvironment(name: string, description: string, appId: string, isActive: boolean, createdBy: string): Promise<IEnvironment> {
        const appDoc = await App.findById(appId).exec();
        if (!appDoc) {
            throw new AppNotFoundError(`App '${appId}' not found`);
        }
        let environmentDoc = new Environment({
            name: name,
            description: description,
            app: appDoc._id,
            isActive: isActive,
            createdBy: createdBy
        });

        try {
            environmentDoc = await (await Environment.create(environmentDoc)).populate('app');
        } catch (err: unknown) {
            throw new Error((err as Error).message);
        }

        const featureFlags = await FeatureFlag.find({ app: appId }).exec();
        for (let i = 0; i < featureFlags.length; i++) {
            // for each feature flag, check if the new environment exists, and if not, create it and set its state to the same as the production environment
            const featureFlag = featureFlags[i];
            const environments = featureFlag.environments;
            const environment = environments.find((env) => env.environment.toString() === environmentDoc.id.toString());
            if (!environment) {
                const prod = await Environment.findOne({ name: 'Production', app: appId }).exec();
                if (!prod) {
                    throw new Error('Production environment not found');
                }
                const prodFlag = environments.find((env) => env.environment.toString() === prod!._id.toString());

                environments.push({
                    environment: environmentDoc,
                    isActive: prodFlag!.isActive,
                    evaluationStrategy: prodFlag!.evaluationStrategy,
                    evaluationPercentage: prodFlag!.evaluationPercentage,
                    allowedUsers: prodFlag!.allowedUsers,
                    disallowedUsers: prodFlag!.disallowedUsers
                });
                featureFlags[i].environments = environments;
                await featureFlags[i].save();
                RedisCache.deleteCacheForFeatureFlag(featureFlag);
            }
        }

        const environment = environmentDoc.toObject();
        if (!isIEnvironment(environment)) {
            throw new Error('Invalid environment data');
        }

        return environment;
    }

    async deleteEnvironment(id: string): Promise<IEnvironment> {
        const environmentDoc = await Environment.findByIdAndDelete(id).exec();
        if (!environmentDoc) {
            throw new EnvironmentNotFoundError(`Environment '${id}' not found`);
        }

        // Remove environment from feature flags
        const featureFlagDocs = await FeatureFlag.find({ app: environmentDoc.app }).exec();
        if (featureFlagDocs) {
            for (const featureFlagDoc of featureFlagDocs) {
                const environments = featureFlagDoc.environments.filter((environment) => {
                    return environment.environment.toString() !== environmentDoc._id.toString();
                }
                );
                featureFlagDoc.environments = environments;
                await featureFlagDoc.save();
                RedisCache.deleteCacheForFeatureFlag(featureFlagDoc);
            }
        }

        const environment = environmentDoc.toObject();
        if (!isIEnvironment(environment)) {
            throw new Error('Invalid environment data');
        }

        return environment;
    }
}

export default new EnvironmentsService();
