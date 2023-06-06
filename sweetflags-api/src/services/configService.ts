import Config from '../models/ConfigModel';
import { IConfig, IConfigInputDTO, IConfigUpdateDTO, IConfigToggleDTO, ConfigType, EvaluationStrategy } from '../interfaces/IConfig';
import { isIConfig, isIConfigArray } from '../type-guards/IConfig';
import Environment from '../models/EnvironmentModel';
import App from '../models/AppModel';
import { ConfigNotFoundError, AppNotFoundError, EnvironmentNotFoundError } from '../errors';
import RedisCache from '../redis';
import md5 from 'md5';
import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IEnvironment } from '../interfaces/IEnvironment';
import logAction from '../utilities/logger';
import { IApp } from '../interfaces/IApp';
import { performance } from 'perf_hooks';
import { env } from 'process';

class ConfigService {
    async getAllConfigs(): Promise<Array<IConfig>> {
        // Try to get the configs from the cache
        const cachedData = await RedisCache.getAllConfigs();
        if (cachedData) {
            return cachedData;
        }

        let configDocs = await
            Config.find()
                .populate('environments.environment')
                .populate('app')
                .populate('environments.allowedUsers')
                .populate('environments.disallowedUsers')
                .exec();
        if (!configDocs) {
            throw new ConfigNotFoundError('No flags found');
        }

        const configs = configDocs.map((flag) => {
            flag = flag.toObject();
            return flag;
        });

        if (!isIConfigArray(configs)) {
            throw new Error('Invalid configs');
        }
        // Cache the result
        RedisCache.setCacheForAllConfigs(configs);
        return configs;
    }

    async getConfigById(id: string): Promise<IConfig> {
        try {
            new ObjectId(id);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${id}`);
        }

        // Try to get the config from the cache
        const cachedData = await RedisCache.getConfig({ id: id });
        if (cachedData) {
            return cachedData;
        }

        const configDoc = await
            Config.findById(id)
                .populate('environments.environment')
                .populate('environments.allowedUsers')
                .populate('environments.disallowedUsers')
                .populate('app')
                .exec();

        if (!configDoc) {
            throw new ConfigNotFoundError(`Flag '${id}' not found`);
        }

        const config = configDoc.toObject();
        if (!isIConfig(config)) {
            throw new Error('Invalid flag');
        }
        // Cache the result
        RedisCache.setCacheForConfig(config);
        return config;
    }

    async getConfigByName(name: string): Promise<IConfig> {
        // Try to get the flag from the cache
        const cachedData = await RedisCache.getConfig({ name: name })
        if (cachedData) {
            return cachedData;
        } else {
            const configDoc = await
                Config.findOne({ name: name })
                    .populate('environments.environment')
                    .populate('environments.allowedUsers')
                    .populate('environments.disallowedUsers')
                    .populate('app')
                    .exec();
            if (!configDoc) {
                throw new ConfigNotFoundError(`Flag '${name}' not found`);
            }

            const config = configDoc.toObject();
            if (!isIConfig(config)) {
                throw new Error('Invalid flag');
            }
            // Cache the result
            RedisCache.setCacheForConfig(config);
            return config;
        }
    }

    async getConfigsByAppId(appId: string): Promise<Array<IConfig>> {
        try {
            new ObjectId(appId);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${appId}`);
        }

        // Try to get the flags from the cache
        const cachedData = await RedisCache.getConfigsByAppId(appId);
        if (cachedData) {
            return cachedData;
        }
        const app = await App.findById(appId);
        if (!app) {
            throw new AppNotFoundError(`App '${appId}' not found`);
        }
        let configDocs = await
            Config.find({ app: app._id })
                .populate('environments.environment')
                .populate('environments.allowedUsers')
                .populate('environments.disallowedUsers')
                .populate('app')
                .exec();
        if (!configDocs) {
            throw new ConfigNotFoundError(`No flags found for app '${appId}'`);
        }

        const configs = configDocs.map((flag) => {
            flag = flag.toObject();
            return flag;
        });

        if (!isIConfigArray(configs)) {
            throw new Error('Invalid flags');
        }
        // Cache the result
        RedisCache.setCacheForConfigsByAppId(configs, appId);

        return configs;
    }

    async getConfigsByAppName(appName: string): Promise<Array<IConfig>> {
        // Try to get the flags from the cache
        const cachedData = await RedisCache.getConfigsByAppName(appName);
        if (cachedData) {
            return cachedData;
        }
        const app = await App.findOne({ name: appName });
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }
        let configDocs = await
            Config.find({ app: app._id })
                .populate('environments.environment')
                .populate('environments.allowedUsers')
                .populate('environments.disallowedUsers')
                .populate('app')
                .exec();
        if (!configDocs) {
            throw new ConfigNotFoundError(`No flags found for app '${appName}'`);
        }

        const configs = configDocs.map((flag) => {
            flag = flag.toObject();
            return flag;
        });

        if (!isIConfigArray(configs)) {
            throw new Error('Invalid flags');
        }
        // Cache the result
        RedisCache.setCacheForConfigsByAppName(configs, appName);
        return configs;
    }

    async getFlagState(flagName: string | undefined, flagId: string | undefined, appId: string, userId: string, environmentId: string): Promise<boolean> {
        if (!flagName && !flagId) {
            throw new Error('Either the id or name property is required');
        }
        // Try to get the flag from the cache
        const cachedData = await RedisCache.getConfig({ name: flagName, id: flagId });
        if (cachedData) {
            return await this.isEnabled(cachedData, userId, environmentId);
        }

        let configDoc: (Document & IConfig) | null;
        if (flagId) {
            try {
                new ObjectId(flagId);
            } catch (err: unknown) {
                throw new Error(`Invalid id ${flagId}`);
            }

            configDoc = await Config
            .findById(flagId)
            .select({ name: 1, environments: { $elemMatch: { environment: environmentId } }, _id: 1 })
            .exec();
        } else if (flagName) {
            configDoc = await Config
            .findOne({ app: appId, name: flagName })
            .select({ name: 1, environments: { $elemMatch: { environment: environmentId } }, _id: 1 })
            .exec();
        } else {
            throw new ConfigNotFoundError(`Either the id or name property is required`);
        }

        if (!configDoc) {
            throw new ConfigNotFoundError(`Flag '${flagName}' not found`);
        }
        RedisCache.setCacheForConfig(configDoc.toObject());
        return await this.isEnabled(configDoc, userId, environmentId);
    }

    async getFlagStatesForUserId(appId: string, userId: string, environmentId: string): Promise<{ flags: { id: string; name: string; isEnabled: boolean }[] }> {
        // Try to get the entire result from the cache
        const cachedData = await RedisCache.getConfigsByUserId(appId, userId)
        if (cachedData) {
            return this.areEnabled(cachedData, userId, environmentId)
        }

        // Try to get the flags from the cache
        const cachedFlags = await RedisCache.getConfigsByAppIdForStates(appId);
        if (cachedFlags) {
            return this.areEnabled(cachedFlags, userId, environmentId);
        }

        // Get them from the database if not in cache
        // performance.mark('getFlagStatesForUserId-db-start');
        const configsDocs = await Config
            .find({ app: appId })
            .select({ 
                name: 1, 
                environments: { $elemMatch: { environment: environmentId } }, 
                _id: 1 })
            .exec();
        if (!configsDocs) {
            throw new ConfigNotFoundError(`No flags found for app '${appId}'`);
        }
        // performance.mark('getFlagStatesForUserId-db-end');
        // performance.measure('getFlagStatesForUserId-db', 'getFlagStatesForUserId-db-start', 'getFlagStatesForUserId-db-end');

        RedisCache.setCacheForConfigsByAppIdForStates(configsDocs, appId);
        RedisCache.setCacheForConfigsByUserId(configsDocs, appId, userId);
        return this.areEnabled(configsDocs, userId, environmentId);
    }

    async toggleFlag(data: IConfigToggleDTO): Promise<IConfig> {
        const { id, environmentId, updatedBy } = data;
        if (!id) {
            throw new Error('Flag id is required');
        }

        try {
            new ObjectId(id);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${id}`);
        }

        const configDoc = await Config.findById(id).populate('environments.environment', 'app').exec();

        if (!configDoc) {
            throw new ConfigNotFoundError(`Flag '${id}' not found`);
        }

        const environments = configDoc.environments;
        const environmentIndex = environments.findIndex(e => (e.environment as IEnvironment).id === environmentId);
        if (environmentIndex === -1) {
            throw new ConfigNotFoundError(`Flag ${id} does not exist for environment ${environmentId}`);
        }

        environments[environmentIndex].isActive = !environments[environmentIndex].isActive;
        configDoc.environments = environments;
        configDoc.updatedBy = updatedBy;
        await configDoc.save();
        await configDoc.populate('app');
        await configDoc.populate('environments.environment');
        await configDoc.populate('environments.allowedUsers');
        await configDoc.populate('environments.disallowedUsers');
        const config = configDoc.toObject();
        if (!isIConfig(config)) {
            throw new Error('Invalid flag');
        }

        // log event
        let message = '';
        if (config.environments[environmentIndex].evaluationStrategy === 'BOOLEAN') {
            message = `Flag '${config.name}' was ${config.environments[environmentIndex].isActive ? 'enabled' : 'disabled'} for environment '${(config.environments[environmentIndex].environment as IEnvironment).name}'`;
        } else if (config.environments[environmentIndex].evaluationStrategy === 'USER') {
            if (config.environments[environmentIndex].isActive) {
                message = `Flag '${config.name}' was enabled for environment '${(config.environments[environmentIndex].environment as IEnvironment).name}' for allowed users '${config.environments[environmentIndex].allowedUsers?.map(u => u.name ? u.name : u.externalId).join(', ')}' and disallowed users '${config.environments[environmentIndex].disallowedUsers?.map(u => u.name ? u.name : u.externalId).join(', ')}'.`;
            } else {
                message = `Flag '${config.name}' was disabled for environment '${(config.environments[environmentIndex].environment as IEnvironment).name}'.`;
            }
        }
        logAction(
            updatedBy,
            'TOGGLE_FLAG',
            'Config',
            config.id,
            message,)



        // invalidate cache
        RedisCache.deleteCacheForConfig(config);
        return config;
    }

    async enableForAllEnvironments(data: IConfigToggleDTO): Promise<IConfig> {
        const { id, updatedBy } = data;
        if (!id) {
            throw new Error('Flag id is required');
        }

        try {
            new ObjectId(id);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${id}`);
        }

        const configDoc = await Config.findById(id).populate('environments.environment', 'app').exec();

        if (!configDoc) {
            throw new ConfigNotFoundError(`Flag '${id}' not found`);
        }

        const environments = configDoc.environments;
        environments.forEach(e => e.isActive = true);
        configDoc.environments = environments;
        configDoc.updatedBy = updatedBy;
        await configDoc.save();
        await configDoc.populate('app');
        await configDoc.populate('environments.environment');
        await configDoc.populate('environments.allowedUsers');
        await configDoc.populate('environments.disallowedUsers');
        const config = configDoc.toObject();
        if (!isIConfig(config)) {
            throw new Error('Invalid flag');
        }

        // log event
        let message = '';
        if (config.environments[0].evaluationStrategy === 'BOOLEAN') {
            message = `Flag '${config.name}' was enabled for all environments`;
        } else if (config.environments[0].evaluationStrategy === 'USER') {
            message = `Flag '${config.name}' was enabled for all environments for allowed users '${config.environments[0].allowedUsers?.map(u => u.name ? u.name : u.externalId).join(', ')}' and disallowed users '${config.environments[0].disallowedUsers?.map(u => u.name ? u.name : u.externalId).join(', ')}'.`;
        }
        logAction(
            updatedBy,
            'ENABLE_FLAG',
            'Config',
            config.id,
            message,
        );

        // invalidate cache
        RedisCache.deleteCacheForConfig(config);
        return config;
    }

    async disableForAllEnvironments(data: IConfigToggleDTO): Promise<IConfig> {
        const { id, updatedBy } = data;
        if (!id) {
            throw new Error('Flag id is required');
        }

        try {
            new ObjectId(id);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${id}`);
        }

        const configDoc = await Config.findById(id).populate('environments.environment', 'app').exec();

        if (!configDoc) {
            throw new ConfigNotFoundError(`Flag '${id}' not found`);
        }

        const environments = configDoc.environments;
        environments.forEach(e => e.isActive = false);
        configDoc.environments = environments;
        configDoc.updatedBy = updatedBy;
        await configDoc.save();
        await configDoc.populate('app');
        await configDoc.populate('environments.environment');
        await configDoc.populate('environments.allowedUsers');
        await configDoc.populate('environments.disallowedUsers');
        const config = configDoc.toObject();
        if (!isIConfig(config)) {
            throw new Error('Invalid flag');
        }

        // log event
        const message = `Flag '${config.name}' was disabled for all environments`;
        logAction(
            updatedBy,
            'DISABLE_FLAG',
            'Config',
            config.id,
            message,
        );

        // invalidate cache
        RedisCache.deleteCacheForConfig(config);
        return config;
    }

    async updateConfigMetadata(id: string, name?: string, description?: string, app?: string, updatedBy?: string): Promise<IConfig> {
        try {
            new ObjectId(id);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${id}`);
        }

        if (!name && !description && !app) {
            throw new Error('At least one of the following properties is required: name, description, app');
        }

        // Validate app
        let appDoc: IApp | null = null;
        if (app) {
            if (!ObjectId.isValid(app)) {
                throw new Error(`Invalid app id ${app}`);
            }

            appDoc = await App.findById(app).exec();
            if (!appDoc) {
                throw new AppNotFoundError(`App with id '${app}' not found`);
            }
        }

        // Fetch the current feature flag document
        const currentConfigDoc = await Config.findById(id).exec();
        if (!currentConfigDoc) {
            throw new ConfigNotFoundError(`Flag '${id}' not found`);
        }

        // Invalidate cache before updating the feature flag
        await RedisCache.deleteCacheForConfig(currentConfigDoc);

        const configDoc = await Config.findByIdAndUpdate(id, { name: name, description: description, app: app, updatedBy: updatedBy }, { new: true }).exec();
        if (!configDoc) {
            throw new ConfigNotFoundError(`Flag '${id}' not found`);
        }

        // if the app has changed, update the environments as well
        if (app) {
            const environments = await Environment.find({ app: app }).exec();
            if (!environments) {
                throw new EnvironmentNotFoundError(`No environments found for app with ID '${app}'`);
            }

            const environmentsArray = environments.map((env) => ({
                environment: env,
                type: ConfigType.BOOLEAN,
                isActive: false,
                evaluationStrategy: EvaluationStrategy.BOOLEAN,
                evaluationPercentage: 0,
                allowedUsers: [],
                disallowedUsers: [],
                updatedBy: updatedBy,
            }));

            configDoc.environments = environmentsArray;
            await configDoc.save();

            // log event
            const message = `Flag '${configDoc.name}' was changed to app '${appDoc?.name}'`;
        }

        await configDoc.populate('app');
        await configDoc.populate('environments.environment');
        await configDoc.populate('environments.allowedUsers');
        await configDoc.populate('environments.disallowedUsers');

        const config = configDoc.toObject();
        if (!isIConfig(config)) {
            throw new Error('Invalid flag');
        }

        // log event
        const message = `Flag '${config.name}' was updated`;
        logAction(
            updatedBy || '',
            'UPDATE_FLAG_METADATA',
            'Config',
            config.id,
            message,
        );

        // invalidate cache
        RedisCache.deleteCacheForConfig(config);
        return config;
    }

    async updateConfig(id: string, data: IConfigUpdateDTO): Promise<IConfig> {
        try {
            new ObjectId(id);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${id}`);
        }

        const { environmentId, isActive, updatedBy, evaluationStrategy, evaluationPercentage, allowedUsers, disallowedUsers } = data;
        const configDoc = await Config.findById(id).exec();
        if (!configDoc) {
            throw new ConfigNotFoundError(`Flag '${id}' not found`);
        }

        const environments = configDoc.environments;
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

        configDoc.environments = environments;
        await configDoc.save();
        await configDoc.populate('app');
        await configDoc.populate('environments.environment');
        await configDoc.populate('environments.allowedUsers');
        await configDoc.populate('environments.disallowedUsers');
        const config = configDoc.toObject();
        if (!isIConfig(config)) {
            throw new Error('Invalid flag');
        }

        // log event
        const message = `Flag '${config.name}' was updated for environment '${(config.environments[environmentIndex].environment as IEnvironment).name}'`;
        logAction(
            updatedBy,
            'UPDATE_FLAG',
            'Config',
            config.id,
            message,
        );

        // invalidate cache
        await RedisCache.deleteCacheForConfig(config);
        // update cache
        RedisCache.setCacheForConfig(config);
        return config;
    }

    async createConfig(data: IConfigInputDTO): Promise<IConfig> {
        const { name, appId, isActive, createdBy, description, evaluationStrategy, evaluationPercentage, allowedUsers, disallowedUsers } = data;

        try {
            new ObjectId(appId);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${appId}`);
        }

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

        const configDoc = new Config({
            name: name,
            description: description || '',
            app: app._id,
            environments: environmentsArray,
            createdBy: createdBy
        });

        await configDoc.save();
        await configDoc.populate('app');
        await configDoc.populate('environments.environment');
        await configDoc.populate('environments.allowedUsers');
        await configDoc.populate('environments.disallowedUsers');
        const config = configDoc.toObject();
        if (!isIConfig(config)) {
            throw new Error('Invalid flag');
        }

        // log event
        const message = `Flag '${config.name}' was created for app '${(config.app as IApp).name}'`;
        logAction(
            createdBy,
            'CREATE_FLAG',
            'Config',
            config.id,
            message,
        );

        // Update the cache
        RedisCache.deleteCacheForConfig(config);
        RedisCache.setCacheForConfig(config);
        return config;
    }

    async deleteConfig(id: string): Promise<IConfig> {
        try {
            new ObjectId(id);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${id}`);
        }

        const configDoc = await Config.findByIdAndDelete(id).exec();
        if (!configDoc) {
            throw new ConfigNotFoundError(`Flag '${id}' not found`);
        }
        await configDoc.populate('app');
        await configDoc.populate('environments.environment');
        await configDoc.populate('environments.allowedUsers');
        await configDoc.populate('environments.disallowedUsers');
        const config = configDoc.toObject();
        if (!isIConfig(config)) {
            throw new Error('Invalid flag');
        }

        // log event
        const message = `Flag '${config.name}' was deleted`;
        logAction(
            config.createdBy,
            'DELETE_FLAG',
            'Config',
            config.id,
            message,
        );

        await RedisCache.deleteCacheForConfig(config)
        return config;
    }


    async isEnabled(config: IConfig, user: string, environmentId: string): Promise<boolean> {
        // need to check if environments.environment is populated, or if it is just an ObjectId
        let environmentIndex: number;
        environmentIndex = config.environments.findIndex((env) => env.environment.toString() === environmentId);
        if (environmentIndex === -1) {
            environmentIndex = config.environments.findIndex((env) => (env.environment as IEnvironment).id === environmentId);
        }
        
        if (environmentIndex === -1) {
            throw new Error(`Environment '${environmentId}' not found`);
        }

        switch (config.environments[environmentIndex].evaluationStrategy) {
            case 'BOOLEAN':
                return config.environments[environmentIndex].isActive;

            case 'USER':
                const userId = new ObjectId(user);

                // If there is nothing in either of these arrays, then we can't evaluate the flag
                if (!config.environments[environmentIndex].allowedUsers || !config.environments[environmentIndex].disallowedUsers) {
                    return false;
                }
                // Allowed users take precedence over disallowed users
                return (
                    config.environments[environmentIndex].isActive &&
                    (config.environments[environmentIndex].allowedUsers!.some(allowedUser => new ObjectId(allowedUser).equals(userId)) ||
                        !config.environments[environmentIndex].disallowedUsers!.some(disallowedUser => new ObjectId(disallowedUser).equals(userId)))
                );

            // Percentage is deterministic based on the user id
            case 'PERCENTAGE':
                const percentage = config.environments[environmentIndex].evaluationPercentage || 0;
                const hash = md5(user);
                const hashInt = parseInt(hash.substr(0, 8), 16);
                const normalized = hashInt / 0xffffffff;

                // multiply by 100 to get a percentage value
                const userPercentage = normalized * 100;
                return userPercentage <= percentage;

            // Probabalistic is random
            case 'PROBABALISTIC':
                const probabalisticPercentage = config.environments[environmentIndex].evaluationPercentage || 0;
                return Math.random() * 100 <= probabalisticPercentage;

            default:
                return false;
        }
    }


    async areEnabled(configs: Array<IConfig>, user: string, environment: string): Promise<{ flags: { id: string; name: string; isEnabled: boolean }[] }> {
        const promises = configs.map(async (flag) => {
            return {
                id: flag._id,
                name: flag.name,
                isEnabled: await this.isEnabled(flag, user, environment)
            };
        });
        const flags = await Promise.all(promises);
        return {
            flags: flags
        }
    }
}

export default new ConfigService();

