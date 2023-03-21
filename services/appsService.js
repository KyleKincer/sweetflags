const App = require('../models/AppModel');
const Environment = require('../models/EnvironmentModel');

class AppsService {
    async getAllApps(isActive) {
        let apps = {};
        if (isActive) {
            apps = await App.find({ isActive: isActive });
        } else {
            apps = await App.find();
        }
        return apps;
    }

    async createApp(name, description, isActive, createdBy) {
        let app = new App({
            name: name,
            description: description,
            isActive: isActive,
            createdBy: createdBy
        });

        try {
            app = await App.create(app);
        } catch (err) {
            throw new Error(err);
        }

        // Creat production environment by default
        const environment = new Environment({
            name: 'Production',
            description: 'Production environment',
            app: app._id,
            isActive: true,
            createdBy: createdBy
        });
        
        try {
            const newEnvironment = await Environment.create(environment);
        } catch (err) {
            throw new Error(err);
        }

        return app;
    }
}

module.exports = new AppsService();