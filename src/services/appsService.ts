import App from '../models/AppModel';
import { IApp } from '../interfaces/IApp';
import Environment from '../models/EnvironmentModel';
import RedisCache from '../redis'
import { AppNotFoundError } from '../errors';
import { isIApp, isIAppArray } from '../type-guards/IApp';
import { Document } from 'mongoose';

class AppsService {
    async getAllApps(isActive: boolean | undefined): Promise<Array<IApp>> {
        let appDocs: Array<Document & IApp> = [];
        if (isActive === undefined) {
            appDocs = await App.find().exec();
        } else {
            appDocs = await App.find({ isActive: isActive }).exec();
        }

        if (!appDocs) {
            throw new AppNotFoundError('No apps found');
        }

        const apps = appDocs.map((app) => {
            return app.toObject();
        });

        if (!isIAppArray(apps)) {
            throw new Error('Invalid app data');
        }
        RedisCache.setCacheForAllApps(apps)
        return apps;
    }

    async getAppById(id: string): Promise<IApp> {
        const appDoc = await App.findById(id).exec();
        if (!appDoc) {
            throw new AppNotFoundError(`App with id ${id} not found`);
        }

        const app = appDoc.toObject();
        if (!isIApp(app)) {
            throw new Error('Invalid app data');
        }

        return app;
    }

    async getAppByName(name: string): Promise<IApp> {
        const appDoc = await App.find({ name: name }).exec();
        if (!appDoc) {
            throw new AppNotFoundError(`App with name ${name} not found`);
        }

        const app = appDoc[0].toObject();
        if (!isIApp(app)) {
            throw new Error('Invalid app data');
        }

        return app;
    }

    async createApp(name: string, description: string, isActive: boolean, createdBy: string): Promise<IApp> {
        let appDoc = new App({
            name: name,
            description: description,
            isActive: isActive,
            createdBy: createdBy
        });

        try {
            appDoc = await App.create(appDoc);
        } catch (err: unknown) {
            throw new Error((err as Error).message);
        }

        // Create production environment by default
        const environment = new Environment({
            name: 'Production',
            description: 'Production environment',
            app: appDoc._id,
            isActive: true,
            createdBy: createdBy
        });
        
        try {
            const newEnvironment = await Environment.create(environment);
        } catch (err: unknown) {
            throw new Error((err as Error).message);
        }

        const app = appDoc.toObject();
        if (!isIApp(app)) {
            throw new Error('Invalid app data');
        }

        return app;
    }
}

export default new AppsService();
