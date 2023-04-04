import App from '../models/AppModel';
import { IApp } from '../interfaces/IApp';
import Environment from '../models/EnvironmentModel';

class AppsService {
    async getAllApps(isActive: boolean | undefined): Promise<Array<IApp>> {
        let apps = [] as Array<IApp>;
        if (isActive) {
            apps = await App.find({ isActive: isActive });
        } else {
            apps = await App.find();
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
