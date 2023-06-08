import Redis from 'ioredis';
import dotenv from 'dotenv';
import { IConfig } from './interfaces/IConfig';
import { IApp } from './interfaces/IApp';

dotenv.config();
class RedisCache {
    private client: Redis;
    
    constructor() {
        if (process.env.IS_LOCAL === 'true') {
            this.client = new Redis({
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
            });
        } else {
            this.client = new Redis({
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
                password: process.env.MEMORYSTORE_REDIS_PASSWORD,
            });
        }
    }

    // Public methods

    // Feature Flags
    
    public getConfig = async (options: {id?: string, name?: string}) => {
        if (options.id)
            return await this.getConfigById(options.id);
        else if (options.name)
            return await this.getConfigByName(options.name);
        else
            throw new Error('Must provide either an id or a name');
    };

    public getConfigByEnvironmentId = async (options: {id?: string, name?: string}, environmentId: string) => {
        if (options.id)
            return await this.getConfigByIdForEnvironmentId(options.id, environmentId);
        else if (options.name)
            return await this.getConfigByNameForEnvironmentId(options.name, environmentId);
        else
            throw new Error('Must provide either an id or a name');
    };

    public getConfigsByAppName = async (appName: string) => {
        const cachedData = await this.getAsync(`configsByAppName${appName}`);
        if (cachedData)
            return JSON.parse(cachedData);
        else
            return null;
    };

    public getConfigsByAppId = async (appId: string) => {
        const cachedData = await this.getAsync(`configsByAppId:${appId}`);
        if (cachedData)
            return JSON.parse(cachedData);
        else
            return null;
    };
    
    public getConfigsByAppIdForStates = async (appId: string) => {
        const cachedData = await this.getAsync(`configsByAppIdForStates:${appId}`);
        if (cachedData)
            return JSON.parse(cachedData);
        else
            return null;
    };

    public getConfigsByUserId = async (appId: string, userId: string) => {
        const cachedData = await this.getAsync(`configsByUserId:${appId}:${userId}`);
        if (cachedData) {
            return JSON.parse(cachedData);
        } else {
            return null;
        }
    }

    public getAllConfigs = async () => {
        const cachedData = await this.getAsync('allConfigs');
        if (cachedData)
            return JSON.parse(cachedData);
        else
            return null;
    };

    public setCacheForConfig = async (config: IConfig) => {
        const { idKey, nameKey } = this.configKeys(config);
        const serializedConfig = JSON.stringify(config);
    
        // Set the cache for both keys
        this.setAsync(idKey, serializedConfig).catch((error) =>
            console.error(`Error setting cache for key '${idKey}': ${error}`)
        );
        this.setAsync(nameKey, serializedConfig).catch((error) =>
            console.error(`Error setting cache for key '${nameKey}': ${error}`)
        );
    };

    public setCacheForConfigByEnvironmentId = async (config: IConfig, environmentId: string) => {
        const { idKey, nameKey } = this.configKeys(config);
        const serializedConfig = JSON.stringify(config);

        // Set the cache for both keys
        this.setAsync(`${idKey}:${environmentId}`, serializedConfig).catch((error) =>
            console.error(`Error setting cache for key '${idKey}:${environmentId}': ${error}`)
        );
        this.setAsync(`${nameKey}:${environmentId}`, serializedConfig).catch((error) =>
            console.error(`Error setting cache for key '${nameKey}:${environmentId}': ${error}`)
        );
    };

    public setCacheForConfigs = async (configs: Array<IConfig>) => {
        configs.forEach((config) => {
            this.setCacheForConfig(config);
        });
    };

    public setCacheForAllConfigs = async (configs: Array<IConfig>) => { 
        const serializedConfigs = JSON.stringify(configs);
        this.setAsync('allConfigs', serializedConfigs).catch((error) =>
            console.error(`Error setting cache for key 'allConfigs': ${error}`)
        );
        this.setCacheForConfigs(configs);
    };

    public setCacheForConfigsByAppName = async (configs: Array<IConfig>, appName: string) => {
        const serializedConfigs = JSON.stringify(configs);
        this.setAsync(`configsByAppName${appName}`, serializedConfigs).catch((error) =>
            console.error(`Error setting cache for key 'configsByAppName${appName}': ${error}`)
        );
        this.setCacheForConfigs(configs);
    };

    public setCacheForConfigsByAppId = async (configs: Array<IConfig>, appId: string) => {
        const serializedConfigs = JSON.stringify(configs);
        this.setAsync(`configsByAppId:${appId}`, serializedConfigs).catch((error) =>
            console.error(`Error setting cache for key 'configsByAppId:${appId}': ${error}`)
        );
        this.setCacheForConfigs(configs);
    };

    public setCacheForConfigsByAppIdForStates = async (configs: Array<IConfig>, appId: string) => {
        const serializedConfigs = JSON.stringify(configs);
        this.setAsync(`configsByAppIdForStates:${appId}`, serializedConfigs).catch((error) =>
            console.error(`Error setting cache for key 'configsByAppIdForStates:${appId}': ${error}`)
        );
    };

    public setCacheForConfigsByUserId = async (configs: Array<IConfig>, appId: string, userId: string) => {
        const serializedConfigs = JSON.stringify(configs);
        this.setAsync(`configsByUserId:${appId}:${userId}`, serializedConfigs).catch((error) => 
            console.error(`Error setting cache for key 'configsByUserId:${appId}:${userId}': ${error}`)
        );
    }
    
    public deleteCacheForConfig = async (config: IConfig) => {
        const { idKey, nameKey } = this.configKeys(config);
    
        // Delete the cache for both keys
        this.delAsync(idKey).catch((error) =>
            console.error(`Error deleting cache for key '${idKey}': ${error}`)
        );
        this.delAsync(nameKey).catch((error) =>
            console.error(`Error deleting cache for key '${nameKey}': ${error}`)
        );
        // Delete the cache for any keys prefixed with idKey and nameKey
        this.deleteKeysByPrefix(`${idKey}:`).catch((error) =>
            console.error(`Error deleting cache for key '${idKey}:': ${error}`)
        );
        this.deleteKeysByPrefix(`${nameKey}:`).catch((error) =>
            console.error(`Error deleting cache for key '${nameKey}:': ${error}`)
        );
        // Delete the cache for allConfigs
        this.delAsync('allConfigs').catch((error) =>
            console.error(`Error deleting cache for key 'allConfigs': ${error}`)
        );
        // Delete the cache for configsByAppName and configsByAppId
        this.delAsync(`configsByAppName${(config.app as IApp).name}`).catch((error) =>
            console.error(`Error deleting cache for key 'configsByAppName:${(config.app as IApp).name}': ${error}`)
        );
        this.delAsync(`configsByAppId:${(config.app as IApp).id}`).catch((error) =>
            console.error(`Error deleting cache for key 'configsByAppId:${(config.app as IApp).id}': ${error}`)
        );
        // Delete the cache for configsByUserId
        this.deleteKeysByPrefix(`configsByUserId:${(config.app as IApp).id}:`).catch((error) =>
            console.error(`Error deleting cache for key 'configsByUserId:${(config.app as IApp).id}:': ${error}`)
        );
        // Delete the cache for configsByAppIdForStates
        this.delAsync(`configsByAppIdForStates:${(config.app as IApp).id}`).catch((error) =>
            console.error(`Error deleting cache for key 'configsByAppIdForStates:${(config.app as IApp).id}': ${error}`)
        );
    }

    // Apps

    public getAllApps = async () => {
        const cachedData = await this.getAsync("allApps");
        if (cachedData)
            return JSON.parse(cachedData);
        else
            return null;
    }

    public getAppById = async (appId: string) => {
        const cachedData = await this.getAsync(`app:id:${appId}`);
        if (cachedData)
            return JSON.parse(cachedData);
        else
            return null;
    }

    public getAppByName = async (appName: string) => {
        const cachedData = await this.getAsync(`app:name:${appName}`);
        if (cachedData)
            return JSON.parse(cachedData);
        else
            return null;
    }

    public setCacheForAllApps = async (apps : Array<IApp>) => {
        const serializedApps = JSON.stringify(apps);
        this.setAsync("allApps", serializedApps).catch((error) => 
            console.error(`Error setting cache for key 'allApps': ${error}`)
        );
    }

    public setCacheForApps = async (apps: Array<IApp>) => {
        apps.forEach((app) =>
            this.setCacheForApp(app)
        );
    }

    public setCacheForApp = async (app: IApp) => {
        const { idKey, nameKey } = this.appKeys(app);
        const serializedApp = JSON.stringify(app)
        this.setAsync(idKey, serializedApp).catch((error) =>
            console.error(`Error setting cache for key '${idKey}': ${error}`)
        );
        this.setAsync(nameKey, serializedApp).catch((error) => 
            console.error(`Error setting cache for key '${nameKey}': ${error}`)
        )
    }

    public deleteCacheForApp = async (app: IApp) => {
        const { idKey, nameKey } = this.appKeys(app);
        this.delAsync(idKey).catch((error) =>
            console.error(`Error deleting cache for key '${idKey}': ${error}`)
        );
        this.delAsync(nameKey).catch((error) =>
            console.error(`Error deleting cache for key '${nameKey}': ${error}`)
        );
        this.delAsync('allApps').catch((error) =>
            console.error(`Error deleting cache for key 'allApps': ${error}`)
        );
    }

    public deleteKeysByPrefix = async (prefix: string): Promise<void> => {
        const matchingKeys = await this.scanKeys(`${prefix}*`);
        if (matchingKeys.length > 0) {
            await this.client.del(...matchingKeys);
        }
    };
    

    // Private methods
    
    private getAsync = async (key: string): Promise<string | null> => {
        return await this.client.get(key);
    };

    private setAsync = async (key: string, value: string, mode?: "KEEPTTL", duration?: "XX"): Promise<string | null> => {
        if (mode && duration) {
            return await this.client.set(key, value, mode, duration);
        } else {
            // Default to 1 hour
            return await this.client.set(key, value, 'EX', 60 * 60);
        }
    };

    private delAsync = async (key: string): Promise<number> => {
        return await this.client.del(key);
    };

    private scanKeys = async (pattern: string): Promise<string[]> => {
        let cursor = '0';
        const matchingKeys: string[] = [];
    
        do {
            const res = await this.client.scan(cursor, 'MATCH', pattern);
            cursor = res[0];
            matchingKeys.push(...res[1]);
        } while (cursor !== '0');
    
        return matchingKeys;
    };
    
    
    private getConfigById = async (id: string) => {
        const cacheKey = this.configKeyForId(id);
        const cachedData = await this.getAsync(cacheKey);
    
        if (cachedData) {
            return JSON.parse(cachedData);
        } else {
            return null;
        }
    };
    
    private getConfigByName = async (name: string) => {
        const cacheKey = this.configKeyForName(name);
        const cachedData = await this.getAsync(cacheKey);
    
        if (cachedData) {
            return JSON.parse(cachedData);
        } else {
            return null;
        }
    };

    private getConfigByIdForEnvironmentId = async (id: string, environmentId: string) => {
        const cacheKey = `${this.configKeyForId(id)}:${environmentId}`;
        const cachedData = await this.getAsync(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        } else {
            return null;
        }
    };

    private getConfigByNameForEnvironmentId = async (name: string, environmentId: string) => {
        const cacheKey = `${this.configKeyForName(name)}:${environmentId}`;
        const cachedData = await this.getAsync(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        } else {
            return null;
        }
    };
    
    private configKeys = (config: IConfig): { idKey: string; nameKey: string } => {
        return {
            idKey: this.configKeyForId(config.id),
            nameKey: this.configKeyForName(config.name),
        };
    };

    private appKeys = (app: IApp): { idKey: string, nameKey: string } => {
        return {
            idKey: this.appKeyForId(app.id),
            nameKey: this.appKeyForName(app.name),
        };
    }

    private appKeyForId = (id: string): string => {
        return `app:id:${id}`;
    }

    private appKeyForName = (name: string): string => {
        return `app:name:${name}`
    }
    
    private configKeyForId = (id: string): string => {
        return `config:id:${id}`;
    };
    
    private configKeyForName = (name: string): string => {
        return `config:name:${name}`;
    };
}

export default new RedisCache();
