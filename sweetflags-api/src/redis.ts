import Redis from 'ioredis';
import dotenv from 'dotenv';
import { IFeatureFlag } from './interfaces/IFeatureFlag';
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
    
    public getFeatureFlag = async (options: {id?: string, name?: string}) => {
        if (options.id)
            return await this.getFeatureFlagById(options.id);
        else if (options.name)
            return await this.getFeatureFlagByName(options.name);
        else
            throw new Error('Must provide either an id or a name');
    };

    public getFeatureFlagsByAppName = async (appName: string) => {
        const cachedData = await this.getAsync(`featureFlagsByAppName:${appName}`);
        if (cachedData)
            return JSON.parse(cachedData);
        else
            return null;
    };

    public getFeatureFlagsByAppId = async (appId: string) => {
        const cachedData = await this.getAsync(`featureFlagsByAppId:${appId}`);
        if (cachedData)
            return JSON.parse(cachedData);
        else
            return null;
    };
    
    public getFeatureFlagsByAppIdForStates = async (appId: string) => {
        const cachedData = await this.getAsync(`featureFlagsByAppIdForStates:${appId}`);
        if (cachedData)
            return JSON.parse(cachedData);
        else
            return null;
    };

    public getFeatureFlagsByUserId = async (appId: string, userId: string) => {
        const cachedData = await this.getAsync(`featureFlagsByUserId:${appId}:${userId}`);
        if (cachedData) {
            return JSON.parse(cachedData);
        } else {
            return null;
        }
    }

    public getAllFeatureFlags = async () => {
        const cachedData = await this.getAsync('allFeatureFlags');
        if (cachedData)
            return JSON.parse(cachedData);
        else
            return null;
    };

    public setCacheForFeatureFlag = async (featureFlag: IFeatureFlag) => {
        const { idKey, nameKey } = this.featureFlagKeys(featureFlag);
        const serializedFeatureFlag = JSON.stringify(featureFlag);
    
        // Set the cache for both keys
        this.setAsync(idKey, serializedFeatureFlag).catch((error) =>
            console.error(`Error setting cache for key '${idKey}': ${error}`)
        );
        this.setAsync(nameKey, serializedFeatureFlag).catch((error) =>
            console.error(`Error setting cache for key '${nameKey}': ${error}`)
        );
    };

    public setCacheForFeatureFlags = async (featureFlags: Array<IFeatureFlag>) => {
        featureFlags.forEach((featureFlag) => {
            this.setCacheForFeatureFlag(featureFlag);
        });
    };

    public setCacheForAllFeatureFlags = async (featureFlags: Array<IFeatureFlag>) => { 
        const serializedFeatureFlags = JSON.stringify(featureFlags);
        this.setAsync('allFeatureFlags', serializedFeatureFlags).catch((error) =>
            console.error(`Error setting cache for key 'allFeatureFlags': ${error}`)
        );
        this.setCacheForFeatureFlags(featureFlags);
    };

    public setCacheForFeatureFlagsByAppName = async (featureFlags: Array<IFeatureFlag>, appName: string) => {
        const serializedFeatureFlags = JSON.stringify(featureFlags);
        this.setAsync(`featureFlagsByAppName:${appName}`, serializedFeatureFlags).catch((error) =>
            console.error(`Error setting cache for key 'featureFlagsByAppName:${appName}': ${error}`)
        );
        this.setCacheForFeatureFlags(featureFlags);
    };

    public setCacheForFeatureFlagsByAppId = async (featureFlags: Array<IFeatureFlag>, appId: string) => {
        const serializedFeatureFlags = JSON.stringify(featureFlags);
        this.setAsync(`featureFlagsByAppId:${appId}`, serializedFeatureFlags).catch((error) =>
            console.error(`Error setting cache for key 'featureFlagsByAppId:${appId}': ${error}`)
        );
        this.setCacheForFeatureFlags(featureFlags);
    };

    public setCacheForFeatureFlagsByAppIdForStates = async (featureFlags: Array<IFeatureFlag>, appId: string) => {
        const serializedFeatureFlags = JSON.stringify(featureFlags);
        this.setAsync(`featureFlagsByAppIdForStates:${appId}`, serializedFeatureFlags).catch((error) =>
            console.error(`Error setting cache for key 'featureFlagsByAppIdForStates:${appId}': ${error}`)
        );
    };

    public setCacheForFeatureFlagsByUserId = async (featureFlags: Array<IFeatureFlag>, appId: string, userId: string) => {
        const serializedFeatureFlags = JSON.stringify(featureFlags);
        this.setAsync(`featureFlagsByUserId:${appId}:${userId}`, serializedFeatureFlags).catch((error) => 
            console.error(`Error setting cache for key 'featureFlagsByUserId:${appId}:${userId}': ${error}`)
        );
    }
    
    public deleteCacheForFeatureFlag = async (featureFlag: IFeatureFlag) => {
        const { idKey, nameKey } = this.featureFlagKeys(featureFlag);
    
        // Delete the cache for both keys
        this.delAsync(idKey).catch((error) =>
            console.error(`Error deleting cache for key '${idKey}': ${error}`)
        );
        this.delAsync(nameKey).catch((error) =>
            console.error(`Error deleting cache for key '${nameKey}': ${error}`)
        );
        // Delete the cache for allFeatureFlags
        this.delAsync('allFeatureFlags').catch((error) =>
            console.error(`Error deleting cache for key 'allFeatureFlags': ${error}`)
        );
        // Delete the cache for featureFlagsByAppName and featureFlagsByAppId
        this.delAsync(`featureFlagsByAppName:${(featureFlag.app as IApp).name}`).catch((error) =>
            console.error(`Error deleting cache for key 'featureFlagsByApp:${(featureFlag.app as IApp).name}': ${error}`)
        );
        this.delAsync(`featureFlagsByAppId:${(featureFlag.app as IApp).id}`).catch((error) =>
            console.error(`Error deleting cache for key 'featureFlagsByApp:${(featureFlag.app as IApp).id}': ${error}`)
        );
        // Delete the cache for featureFlagsByUserId
        this.deleteKeysByPrefix(`featureFlagsByUserId:${(featureFlag.app as IApp).id}:`).catch((error) =>
            console.error(`Error deleting cache for key 'featureFlagsByUserId:${(featureFlag.app as IApp).id}:': ${error}`)
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
    
    
    private getFeatureFlagById = async (id: string) => {
        const cacheKey = this.featureFlagKeyForId(id);
        const cachedData = await this.getAsync(cacheKey);
    
        if (cachedData) {
            return JSON.parse(cachedData);
        } else {
            return null;
        }
    };
    
    private getFeatureFlagByName = async (name: string) => {
        const cacheKey = this.featureFlagKeyForName(name);
        const cachedData = await this.getAsync(cacheKey);
    
        if (cachedData) {
            return JSON.parse(cachedData);
        } else {
            return null;
        }
    };
    
    private featureFlagKeys = (featureFlag: IFeatureFlag): { idKey: string; nameKey: string } => {
        return {
            idKey: this.featureFlagKeyForId(featureFlag.id),
            nameKey: this.featureFlagKeyForName(featureFlag.name),
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
    
    private featureFlagKeyForId = (id: string): string => {
        return `featureFlag:id:${id}`;
    };
    
    private featureFlagKeyForName = (name: string): string => {
        return `featureFlag:name:${name}`;
    };
}

export default new RedisCache();
