import App from '../models/AppModel';
import { IApp } from '../interfaces/IApp';
import Environment from '../models/EnvironmentModel';
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

        return apps;
    }

    async createApp(name: string, description: string, isActive: boolean, createdBy: string): Promise<IApp> {
        let app = new App({
            name: name,
            description: description,
            isActive: isActive,
            createdBy: createdBy
        });

        try {
            app = await App.create(app);
        } catch (err: unknown) {
            throw new Error((err as Error).message);
        }

        // Create production environment by default
        const environment = new Environment({
            name: 'Production',
            description: 'Production environment',
            app: app._id,
            isActive: true,
            createdBy: createdBy
        });
        
        try {
            const newEnvironment = await Environment.create(environment);
        } catch (err: unknown) {
            throw new Error((err as Error).message);
        }

        return app;
    }
}

export default new AppsService();
