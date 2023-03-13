const App = require('../models/AppModel');
const Environment = require('../models/EnvironmentModel');

// GET /api/apps
async function getAllApps(req, res) {
    const isActive = req.query.isActive;
    try {
        if (isActive) {
            const apps = await App.find({ isActive: isActive });
            res.status(200).json(apps);
        } else {
            const apps = await App.find();
            res.status(200).json(apps);
        }
      } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
      }
};

// POST /api/apps
async function createApp(req, res) {
    const app = new App({
        name: req.body.name,
        description: req.body.description,
        isActive: req.body.isActive,
        createdBy: req.body.createdBy
    });

    App.create(app).then((result) => {
        res.status(201).json(result);
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ message: err.message });
    });

    // Creat production environment by default
    const environment = new Environment({
        name: 'Production',
        description: 'Production environment',
        app: app._id,
        isActive: true,
        createdBy: req.body.createdBy
    });
    Environment.create(environment).then((result) => {
        console.log(`Created environment ${result.name} for app ${app.name}`);
    }).catch((err) => {
        console.log(err);
    });
}

module.exports = {
    getAllApps,
    createApp
};