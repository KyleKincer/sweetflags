// redis.ts
import { json } from 'body-parser';
import Redis from 'ioredis';
import config from './config';
import { IFeatureFlag } from './models/FeatureFlagModel';


class RedisCache {
    private client: Redis;

    constructor() {
        this.client = new Redis({
            host: config.redis.host,
            port: config.redis.port
        });
    }

    // Public methods
    
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

    public getFeatureFlagsByUserId = async (appName: string, userId: string) => {
        const cachedData = await this.getAsync(`featureFlagsByUserId:${appName}:${userId}`);
        if (cachedData) {
            return JSON.parse(cachedData);
        } else {
            return null;
        }
    }

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

    public setCacheForFeatureFlagsByUserId = async (featureFlags: Array<IFeatureFlag>, appName: string, userId: string) => {
        const serializedFeatureFlags = JSON.stringify(featureFlags);
        this.setAsync(`featureFlagsByUserId:${appName}:${userId}`, serializedFeatureFlags).catch((error) => 
            console.error(`Error setting cache for key 'featureFlagsByUserId:${appName}:${userId}': ${error}`)
        );
        this.setCacheForFeatureFlags(featureFlags);
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
        // Delete the cache for featureFlagsByApp
        const appName = 
        this.delAsync(`featureFlagsByApp:${featureFlag.app.name}`).catch((error) =>
            console.error(`Error deleting cache for key 'featureFlagsByApp:${featureFlag.app.name}': ${error}`)
        );
    }

    // Private methods
    
    private getAsync = async (key: string): Promise<string | null> => {
        return await this.client.get(key);
    };

    private setAsync = async (key: string, value: string, mode?: "KEEPTTL", duration?: "XX"): Promise<string | null> => {
        if (mode && duration) {
            return await this.client.set(key, value, mode, duration);
        } else {
            return await this.client.set(key, value);
        }
    };

    private delAsync = async (key: string): Promise<number> => {
        return await this.client.del(key);
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
            idKey: this.featureFlagKeyForId(featureFlag._id),
            nameKey: this.featureFlagKeyForName(featureFlag.name),
        };
    };
    
    private featureFlagKeyForId = (id: string): string => {
        return `featureFlag:id:${id}`;
    };
    
    private featureFlagKeyForName = (name: string): string => {
        return `featureFlag:name:${name}`;
    };
}

export default new RedisCache();
