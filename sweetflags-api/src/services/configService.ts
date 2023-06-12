import Config from '../models/ConfigModel';
import { IConfig, IConfigInputDTO, IConfigUpdateDTO, IConfigToggleDTO, ConfigType, EvaluationStrategy, IConfigEnvironment } from '../interfaces/IConfig';
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

    async getConfigValue(configId: string, userId: string | undefined, environmentId: string | undefined): Promise<{ name: string, id: string, value: boolean | string | object, type: string }> {
        if (!configId) {
            throw new Error('configId is required');
        }

        // Try to get the full config from the cache
        let cachedData = await RedisCache.getConfig({ id: configId });
        if (cachedData) {
            const configValue = this.configValue(cachedData, userId, environmentId)
            return {
                name: cachedData.name,
                id: cachedData.id,
                value: configValue.value,
                type: configValue.type
            }
        }

        // Try to get a partial config from the cache
        if (environmentId) {
            cachedData = await RedisCache.getConfigByEnvironmentId({ id: configId }, environmentId);
        }
        if (cachedData) {
            const configValue = this.configValue(cachedData, userId, environmentId)
            return {
                name: cachedData.name,
                id: cachedData.id,
                value: configValue.value,
                type: configValue.type
            }
        }

        // Try to get the config from the database
        let configDoc: (Document & IConfig) | null;
        if (configId) {
            try {
                new ObjectId(configId);
            } catch (err: unknown) {
                throw new Error(`Invalid id ${configId}`);
            }
            // Get specified environment if provided, otherwise get Production
            if (environmentId) {
                configDoc = await Config
                    .findById(configId)
                    .select({ name: 1, environments: { $elemMatch: { environment: environmentId } }, _id: 1 })
                    .exec();
            } else {
                // this might be a dangerous assumption, but Production should always be the first environment since it is created upon config creation
                configDoc = await Config
                    .findById(configId)
                    .select({ name: 1, 'environments': { $slice: 1 }, _id: 1 })
                    .exec();
            }
        } else {
            throw new ConfigNotFoundError(`configId is required`);
        }

        if (!configDoc) {
            throw new ConfigNotFoundError(`Config id '${configId}' not found`);
        }
        RedisCache.setCacheForConfigByEnvironmentId(configDoc.toObject(), (configDoc.environments[0].environment as IEnvironment).id);
        const configValue = this.configValue(configDoc, userId, environmentId)
        return {
            name: configDoc.name,
            id: configDoc.id,
            value: configValue.value,
            type: configValue.type
        }
    }

    // get value of a config depending on its type
    configValue(config: IConfig, userId: string | undefined, environmentId: string | undefined): { value: boolean | string | object, type: string } {
        // if environment is undefined, default to Production environment
        let environment = environmentId ? config.environments.find((env) => env.environment.toString() === environmentId) : config.environments.find((env) => (env.environment as IEnvironment).name === 'Production');
        if (!environment && environmentId) {
            throw new Error(`Environment '${environmentId}' not found`);
        } else if (!environment && config.environments.length === 1) { 
            // if only one environment exists, default to that environment
            environment = config.environments[0];
        } else if (!environment) {
            throw new Error(`Environment 'Production' not found`);
        }

        const type = environment.type;
        const value = environment.value;
        environmentId = environmentId ? environmentId : (environment.environment as IEnvironment).id;

        let returnValue: boolean | string | object;
        let returnType: string;
        switch (type) {
            case ConfigType.BOOLEAN:
                returnType = ConfigType.BOOLEAN;
                returnValue = this.isEnabled(environment, userId);
                break;
            case ConfigType.TEXT:
                returnType = ConfigType.TEXT;
                returnValue = value as string;
                break;
            case ConfigType.JSON:
                returnType = ConfigType.JSON;
                returnValue = value as object;
                break;
            default:
                throw new Error(`Invalid type '${type}'`);
        }
        return { value: returnValue, type: returnType };
    }

    async configValues(configs: Array<IConfig>, user: string, environment: string): Promise<{ configs: { id: string; name: string; type: string; value: boolean | string | object }[] }> {
        const promises = configs.map(async (config) => {
            const { value, type } = this.configValue(config, user, environment);
            return {
                id: config._id,
                name: config.name,
                value,
                type,
            };
        });
        const configValues = await Promise.all(promises);
        return {
            configs: configValues
        }
    }

    async getConfigStatesForUserId(appId: string, userId: string, environmentId: string): Promise<{ configs: { id: string; name: string; type: string; value: boolean | string | object }[] }> {
        // Try to get the entire result from the cache
        const cachedData = await RedisCache.getConfigsByUserId(appId, userId)
        if (cachedData) {
            return this.configValues(cachedData, userId, environmentId)
        }

        // Try to get the flags from the cache
        const cachedFlags = await RedisCache.getConfigsByAppIdForStates(appId);
        if (cachedFlags) {
            return this.configValues(cachedFlags, userId, environmentId);
        }

        // Get them from the database if not in cache
        // performance.mark('getConfigStatesForUserId-db-start');
        const configsDocs = await Config
            .find({ app: appId })
            .select({
                name: 1,
                environments: { $elemMatch: { environment: environmentId } },
                _id: 1
            })
            .exec();
        if (!configsDocs) {
            throw new ConfigNotFoundError(`No flags found for app '${appId}'`);
        }
        // performance.mark('getConfigStatesForUserId-db-end');
        // performance.measure('getConfigStatesForUserId-db', 'getConfigStatesForUserId-db-start', 'getConfigStatesForUserId-db-end');

        RedisCache.setCacheForConfigsByAppIdForStates(configsDocs, appId);
        RedisCache.setCacheForConfigsByUserId(configsDocs, appId, userId);
        return this.configValues(configsDocs, userId, environmentId);
    }

    async toggleFlag(data: IConfigToggleDTO): Promise<IConfig> {
        const { id, environmentId, updatedBy } = data;
        if (!id) {
            throw new Error('Config id is required');
        }

        try {
            new ObjectId(id);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${id}`);
        }

        const configDoc = await Config.findById(id).populate('environments.environment', 'app').exec();

        if (!configDoc) {
            throw new ConfigNotFoundError(`Config '${id}' not found`);
        }

        const environments = configDoc.environments;
        const environmentIndex = environments.findIndex(e => (e.environment as IEnvironment).id === environmentId);
        if (environmentIndex === -1) {
            throw new ConfigNotFoundError(`Config ${id} does not exist for environment ${environmentId}`);
        }

        if (!(typeof environments[environmentIndex].value === 'boolean')) {
            throw new Error(`Config ${id} is not a boolean config`);
        }

        (environments[environmentIndex].value as boolean) = (!environments[environmentIndex].value as boolean);
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
            message = `Config '${config.name}' was ${config.environments[environmentIndex].value as boolean ? 'enabled' : 'disabled'} for environment '${(config.environments[environmentIndex].environment as IEnvironment).name}'`;
        } else if (config.environments[environmentIndex].evaluationStrategy === 'USER') {
            if (config.environments[environmentIndex].value as boolean) {
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
            throw new Error('Config id is required');
        }

        try {
            new ObjectId(id);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${id}`);
        }

        const configDoc = await Config.findById(id).populate('environments.environment', 'app').exec();

        if (!configDoc) {
            throw new ConfigNotFoundError(`Config '${id}' not found`);
        }

        const environments = configDoc.environments;
        environments.forEach(e => e.value = true);
        configDoc.environments = environments;
        configDoc.updatedBy = updatedBy;
        await configDoc.save();
        await configDoc.populate('app');
        await configDoc.populate('environments.environment');
        await configDoc.populate('environments.allowedUsers');
        await configDoc.populate('environments.disallowedUsers');
        const config = configDoc.toObject();
        if (!isIConfig(config)) {
            throw new Error('Invalid config');
        }

        // log event
        let message = '';
        if (config.environments[0].evaluationStrategy === 'BOOLEAN') {
            message = `Config '${config.name}' was enabled for all environments`;
        } else if (config.environments[0].evaluationStrategy === 'USER') {
            message = `Config '${config.name}' was enabled for all environments for allowed users '${config.environments[0].allowedUsers?.map(u => u.name ? u.name : u.externalId).join(', ')}' and disallowed users '${config.environments[0].disallowedUsers?.map(u => u.name ? u.name : u.externalId).join(', ')}'.`;
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
            throw new Error('Config id is required');
        }

        try {
            new ObjectId(id);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${id}`);
        }

        const configDoc = await Config.findById(id).populate('environments.environment', 'app').exec();

        if (!configDoc) {
            throw new ConfigNotFoundError(`Config '${id}' not found`);
        }

        const environments = configDoc.environments;
        environments.forEach(e => e.value = false);
        configDoc.environments = environments;
        configDoc.updatedBy = updatedBy;
        await configDoc.save();
        await configDoc.populate('app');
        await configDoc.populate('environments.environment');
        await configDoc.populate('environments.allowedUsers');
        await configDoc.populate('environments.disallowedUsers');
        const config = configDoc.toObject();
        if (!isIConfig(config)) {
            throw new Error('Invalid config');
        }

        // log event
        const message = `Config '${config.name}' was disabled for all environments`;
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

        const { environmentId, value, updatedBy, evaluationStrategy, evaluationPercentage, allowedUsers, disallowedUsers } = data;
        const configDoc = await Config.findById(id).exec();
        if (!configDoc) {
            throw new ConfigNotFoundError(`Config '${id}' not found`);
        }

        const environments = configDoc.environments;
        const environmentIndex = environments.findIndex(e => e.environment.toString() === environmentId);
        if (environmentIndex === -1) {
            throw new EnvironmentNotFoundError(`Environment ${environmentId} not found`);
        }

        environments[environmentIndex].value = typeof value === 'undefined' ? environments[environmentIndex].value : value;
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
            throw new Error('Invalid config');
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
        const {
            name,
            appId,
            createdBy,
            description,
            type,
            value,
            enumValues,
            evaluationStrategy,
            evaluationPercentage,
            allowedUsers,
            disallowedUsers
        } = data;

        try {
            new ObjectId(appId);
        } catch (err: unknown) {
            throw new Error(`Invalid id ${appId}`);
        }

        const app = await App.findById(appId).exec();
        if (!app) {
            throw new AppNotFoundError(`App with ID '${appId}' not found`);
        }

        // Validate input parameters
        switch (type) {
            case ConfigType.BOOLEAN:
                if (typeof value !== 'boolean') {
                    throw new Error(`Invalid value for type ${type}-- expected boolean, got ${typeof value}`);
                }
                if (typeof evaluationStrategy === 'undefined') {
                    throw new Error(`Invalid value for type ${type}-- expected evaluationStrategy to be defined`);
                }
                switch (evaluationStrategy) {
                    case EvaluationStrategy.BOOLEAN:
                        if (typeof evaluationPercentage !== 'undefined') {
                            throw new Error(`Invalid value for evaluationStrategy ${evaluationStrategy}-- expected evaluationPercentage to be undefined`);
                        }
                        if (typeof allowedUsers !== 'undefined') {
                            throw new Error(`Invalid value for evaluationStrategy ${evaluationStrategy}-- expected allowedUsers to be undefined`);
                        }
                        if (typeof disallowedUsers !== 'undefined') {
                            throw new Error(`Invalid value for evaluationStrategy ${evaluationStrategy}-- expected disallowedUsers to be undefined`);
                        }
                        break;
                    case EvaluationStrategy.USER:
                        if (typeof evaluationPercentage !== 'undefined') {
                            throw new Error(`Invalid value for evaluationStrategy ${evaluationStrategy}-- expected evaluationPercentage to be undefined`);
                        }
                        if (typeof allowedUsers === 'undefined' && typeof disallowedUsers === 'undefined') {
                            throw new Error(`Invalid value for evaluationStrategy ${evaluationStrategy}-- expected allowedUsers or disallowedUsers to be defined`);
                        }
                        if (typeof allowedUsers !== 'undefined' && typeof disallowedUsers !== 'undefined') {
                            throw new Error(`Invalid value for evaluationStrategy ${evaluationStrategy}-- expected only one of allowedUsers or disallowedUsers to be defined`);
                        }
                        break;
                    case EvaluationStrategy.PERCENTAGE:
                        if (typeof evaluationPercentage === 'undefined') {
                            throw new Error(`Invalid value for evaluationStrategy ${evaluationStrategy}-- expected evaluationPercentage to be defined`);
                        }
                        if (typeof allowedUsers !== 'undefined') {
                            throw new Error(`Invalid value for evaluationStrategy ${evaluationStrategy}-- expected allowedUsers to be undefined`);
                        }
                        if (typeof disallowedUsers !== 'undefined') {
                            throw new Error(`Invalid value for evaluationStrategy ${evaluationStrategy}-- expected disallowedUsers to be undefined`);
                        }
                        break;
                    default:
                        throw new Error(`Invalid value for evaluationStrategy ${evaluationStrategy}-- expected one of ${Object.values(EvaluationStrategy).join(', ')}`);
                }
                break;
            case ConfigType.JSON:
                if (typeof value !== 'object') {
                    throw new Error(`Invalid value for type ${type}-- expected object, got ${typeof value}`);
                }
                break;
            case ConfigType.TEXT:
                if (typeof value !== 'string') {
                    throw new Error(`Invalid value for type ${type}-- expected string, got ${typeof value}`);
                }
                break;
            case ConfigType.ENUM:
                if (typeof value !== 'string') {
                    throw new Error(`Invalid value for type ${type}-- expected string, got ${typeof value}`);
                }
                if (!data.enumValues) {
                    throw new Error(`Invalid value for type ${type}-- expected enumValues to be defined`);
                }
                if (!data.enumValues.includes(value)) {
                    throw new Error(`Invalid value for type ${type}-- expected value to be one of ${data.enumValues.join(', ')}`);
                }
                break;
            default:
                throw new Error(`Invalid type ${type}-- expected one of ${Object.values(ConfigType).join(', ')}`);
        }

        const environments = await Environment.find({ app: app._id }).exec();
        if (!environments) {
            throw new EnvironmentNotFoundError(`No environments found for app with ID '${appId}'`);
        }

        const environmentsArray = environments.map((env) => {
            const environmentObj: Record<string, any> = {
                environment: env._id,
                type: type,
                value: value
            };

            if (type === ConfigType.ENUM && enumValues !== undefined) {
                environmentObj.enumValues = enumValues;
            }
            if (type === ConfigType.BOOLEAN) {
                if (evaluationStrategy !== undefined) {
                    environmentObj.evaluationStrategy = evaluationStrategy;
                }
                if ((
                    evaluationStrategy === EvaluationStrategy.PERCENTAGE ||
                    evaluationStrategy === EvaluationStrategy.PROBABALISTIC)
                    && evaluationPercentage !== undefined) {
                    environmentObj.evaluationPercentage = evaluationPercentage;
                }
                if (evaluationStrategy === EvaluationStrategy.USER && allowedUsers !== undefined) {
                    environmentObj.allowedUsers = allowedUsers;
                }
                if (evaluationStrategy === EvaluationStrategy.USER && disallowedUsers !== undefined) {
                    environmentObj.disallowedUsers = disallowedUsers;
                }
            }

            return environmentObj;
        });

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
        const message = `Config '${config.name}' was created for app '${(config.app as IApp).name}'`;
        logAction(
            createdBy,
            'CREATE_CONFIG',
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


    isEnabled(environment: IConfigEnvironment, user: string | undefined): boolean {
        const configValue = environment.value;
        let userId: ObjectId;
        switch (environment.evaluationStrategy) {
            case 'BOOLEAN':
                if (typeof configValue !== 'boolean') {
                    throw new Error(`Config has no boolean value for environment '${(environment.environment as IEnvironment).name}'`);
                } else {
                    return configValue as boolean;
                }

            case 'USER':
                if (!user) {
                    throw new Error(`Evaluation strategy is USER but no user was provided`)
                }
                try {
                    const userId = new ObjectId(user);
                } catch (err: unknown) {
                    throw new Error(`Invalid user ID ${user}`);
                }

                // If there is nothing in either of these arrays, evaluate as a boolean flag
                if (!environment.allowedUsers || !environment.disallowedUsers) {
                    return configValue as boolean;
                }
                // Allowed users take precedence over disallowed users
                return (
                    configValue as boolean &&
                    (environment.allowedUsers!.some(allowedUser => new ObjectId(allowedUser).equals(userId)) ||
                        !environment.disallowedUsers!.some(disallowedUser => new ObjectId(disallowedUser).equals(userId)))
                );

            // Percentage is deterministic based on the user id
            case 'PERCENTAGE':
                if (!user) {
                    throw new Error(`Evaluation strategy is PERCENTAGE but no user was provided`)
                }
                const percentage = environment.evaluationPercentage || 0;
                const hash = md5(user);
                const hashInt = parseInt(hash.substr(0, 8), 16);
                const normalized = hashInt / 0xffffffff;

                // multiply by 100 to get a percentage value
                const userPercentage = normalized * 100;
                return userPercentage <= percentage;

            // Probabalistic is random
            case 'PROBABALISTIC':
                const probabalisticPercentage = environment.evaluationPercentage || 0;
                return Math.random() * 100 <= probabalisticPercentage;

            default:
                return false;
        }
    }
}

export default new ConfigService();

