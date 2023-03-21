const App = require('../models/AppModel');
const Environment = require('../models/EnvironmentModel');
const AppsService = require('../services/appsService');


async function getAllApps(req, res) {
    const isActive = req.query.isActive;
    try {
        const apps = await AppsService.getAllApps(isActive);
        res.status(200).json(apps);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

async function createApp(req, res) {
    try {
        const app = await AppsService.createApp(req.body.name, req.body.description, req.body.isActive, req.body.createdBy);
        res.status(201).json(app);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getAllApps,
    createApp
};