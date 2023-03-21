const mongoose = require('mongoose');
const App = require('../models/AppModel');
const Environment = require('../models/EnvironmentModel');
const EnvironmentsService = require('../services/environmentsService');

async function getAllEnvironments(_req, res) {
    try {
        const environments = await EnvironmentsService.getAllEnvironments();
        res.status(200).json(environments);
    } catch (err) {
        console.error(err);
        if (err instanceof EnvironmentNotFoundError) {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
}

async function getEnvironmentById(req, res) {
    try {
        const environment = await EnvironmentsService.getEnvironmentById(req.params.id);
        res.status(200).json(environment);
    } catch (err) {
        console.error(err);
        if (err instanceof EnvironmentNotFoundError) {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
}

async function getEnvironmentsByAppName(req, res) {
    try {
        const environments = await EnvironmentsService.getAppByName(req.params.appName);
        res.status(200).json(environments);
    } catch (err) {
        console.error(err);
        if (err instanceof AppNotFoundError || err instanceof EnvironmentNotFoundError) {
            res.status(404).json({ message: err.message });
        }
    }
}

async function createEnvironment(req, res) {
    try {
        const environment = await EnvironmentsService.createEnvironment(
            req.body.name, 
            req.body.description, 
            req.body.appName, 
            req.body.isActive, 
            req.body.createdBy);
        res.status(201).json(environment);
    } catch (err) {
        console.error(err);
        if (err instanceof AppNotFoundError) {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
}

module.exports = {
    getAllEnvironments,
    getEnvironmentById,
    getEnvironmentsByAppName,
    createEnvironment
};