const mongoose = require('mongoose');
const App = require('../models/AppModel');
const Environment = require('../models/EnvironmentModel');

// GET /api/environments
// Return all environments
async function getAllEnvironments(_req, res) {
    try {
        const environments = await Environment.find();
        res.status(200).json(environments);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

// GET /api/environments/id/:id
// Return environment data for a given id
async function getEnvironmentById(req, res) {
    try {
        const environment = await Environment.findById(req.params.id);
        res.status(200).json(environment);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

// GET /api/environments/:appName
// Return environment data for all environments for a given app name
async function getEnvironmentsByAppName(req, res) {
    try {
        const app = await App.findOne({ name: req.params.appName });
        if (!app) {
            return res.status(400).json({ message: `App '${req.params.appName}' not found` });
        }

        const environments = await Environment.find({ app: app._id });
        res.status(200).json(environments);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

// POST /api/environments
// Create a new environment
/*
    {
        "name": "Development",                    // String, required
        "description": "Development environment", // String, optional
        "appName": "Symphony",                    // String, required
        "isActive": true,                         // Boolean, optional, default: true
        "createdBy": "admin"                      // String, required
    }
*/
async function createEnvironment(req, res) {
    const app = await App.findOne({ name: req.body.appName });
    if (!app) {
        return res.status(400).json({ message: `App '${req.body.appName}' not found` });
    }

    const environment = new Environment({
        name: req.body.name,
        description: req.body.description,
        app: app._id,
        isActive: req.body.isActive,
        createdBy: req.body.createdBy
    });

    Environment.create(environment).then((result) => {
        res.status(201).json(result);
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ message: err.message });
    });
}

module.exports = {
    getAllEnvironments,
    getEnvironmentById,
    getEnvironmentsByAppName,
    createEnvironment
};