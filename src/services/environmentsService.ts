import App from '../models/AppModel';
import Environment, { IEnvironment } from '../models/EnvironmentModel';
import { AppNotFoundError, EnvironmentNotFoundError } from '../errors';

class EnvironmentsService {
    async getAllEnvironments(): Promise<Array<IEnvironment>> {
        const environments = await Environment.find().populate('app').exec();
        if (!environments) {
            throw new EnvironmentNotFoundError('No environments found');
        }
        return environments;
    }

    async getEnvironmentById(id: string): Promise<IEnvironment> {
        try {
            const environment = await Environment.findById(id).populate('app').exec();
            if (!environment) {
                throw new EnvironmentNotFoundError(`Environment '${id}' not found`);
            }
            return environment;
        } catch (err: unknown) {
            throw new Error((err as Error).message);
        } 
    }

    async getEnvironmentsByAppName(appName: string): Promise<Array<IEnvironment>> {
        try {
            const app = await App.findOne( { name: appName }).exec();
            if (!app) {
                throw new AppNotFoundError(`App '${appName}' not found`);
            }
            const environments = await Environment.find({ app: app._id }).populate('app').exec();
            if (!environments) {
                throw new EnvironmentNotFoundError(`No environments found for app '${appName}'`);
            }
            return environments;
        } catch (err: unknown) {
            throw new Error((err as Error).message);
        }
    }

    async createEnvironment(name: string, description: string, appName: string, isActive: boolean, createdBy: string): Promise<IEnvironment> {
        const app = await App.findOne({ name: appName }).exec();
        if (!app) {
            throw new AppNotFoundError(`App '${appName}' not found`);
        }
        let environment = new Environment({
            name: name,
            description: description,
            app: app._id,
            isActive: isActive,
            createdBy: createdBy
        });

        try {
            environment = await (await Environment.create(environment)).populate('app');
        } catch (err: unknown) {
            throw new Error((err as Error).message);
        }

        return environment;
    }
}

export default new EnvironmentsService();
