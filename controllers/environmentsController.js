const mongoose = require('mongoose');
const App = require('../models/AppModel');
const Environment = require('../models/EnvironmentModel');

async function getAllEnvironments(_req, res) {
    try {
        const environments = await Environment.find().populate('app').exec();
        res.status(200).json(environments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

async function getEnvironmentById(req, res) {
    try {
        const environment = await Environment.findById(req.params.id).populate('app').exec();
        res.status(200).json(environment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

async function getEnvironmentsByAppName(req, res) {
    try {
        const app = await App.findOne({ name: req.params.appName });
        if (!app) {
            return res.status(400).json({ message: `App '${req.params.appName}' not found` });
        }

        const environments = await Environment.find({ app: app._id }).populate('app').exec();
        res.status(200).json(environments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

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
        console.error(err);
        res.status(500).json({ message: err.message });
    });
}

module.exports = {
    getAllEnvironments,
    getEnvironmentById,
    getEnvironmentsByAppName,
    createEnvironment
};