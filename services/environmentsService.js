const App = require('../models/AppModel');
const Environment = require('../models/EnvironmentModel');
const { AppNotFoundError, EnvironmentNotFoundError } = require('../errors');

class EnvironmentsService {
    async getAllEnvironments() {
        const environments = Environment.find().populate('app').exec();
        if (!environments) {
            throw new EnvironmentNotFoundError('No environments found');
        }
        return environments;
    }

    async getEnvironmentById(id) {
        try {
            const environment = await Environment.findById(id).populate('app').exec();
            if (!environment) {
                throw new EnvironmentNotFoundError(`Environment '${id}' not found`);
            }
            return environment;
        } catch (err) {
            throw new Error(err);
        } 
    }

    async getEnvironmentsByAppName(appName) {
        try {
            const app = await App.findOne( { name: appName }).exec();
            if (!app) {
                throw new AppNotFoundError(`App '${appName}' not found`);
            }
            const environments = Environment.find({ app: app._id }).populate('app').exec();
            if (!environments) {
                throw new EnvironmentNotFoundError(`No environments found for app '${appName}'`);
            }
            return environments;
        } catch (err) {
            throw new Error(err);
        }
    }

    async createEnvironment(name, description, appName, isActive, createdBy) {
        const app = App.findOne({ name: appName }).exec();
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
            environment = await Environment.create(environment);
        } catch (err) {
            throw new Error(err);
        }

        return environment;
    }
}