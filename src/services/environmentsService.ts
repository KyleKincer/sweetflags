import App from '../models/AppModel';
import Environment from '../models/EnvironmentModel';
import { IEnvironment } from '../interfaces/IEnvironment';
import { AppNotFoundError, EnvironmentNotFoundError } from '../errors';
import { isIEnvironment, isIEnvironmentArray } from '../type-guards/IEnvironment';

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

    async getEnvironmentsByAppId(appId: string): Promise<Array<IEnvironment>> {
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

        return environments;
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

    async createEnvironment(name: string, description: string, appName: string, isActive: boolean, createdBy: string): Promise<IEnvironment> {
        const appDoc = await App.findOne({ name: appName }).exec();
        if (!appDoc) {
            throw new AppNotFoundError(`App '${appName}' not found`);
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

        await environmentDoc.populate('app');
        const environment = environmentDoc.toObject();
        if (!isIEnvironment(environment)) {
            throw new Error('Invalid environment data');
        }

        return environment;
    }
}

export default new EnvironmentsService();
