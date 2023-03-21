const FeatureFlag = require('../models/FeatureFlagModel');
const Environment = require('../models/EnvironmentModel');
const App = require('../models/AppModel');
const FeatureFlagService = require('../services/featureFlagService');
const mongoose = require('mongoose');
const featureFlagService = require('../services/featureFlagService');
const { FlagNotFoundError, AppNotFoundError, EnvironmentNotFoundError } = require('../errors');

async function getAllFlags(_req, res) {
    try {
        const featureFlags = await FeatureFlagService.getAllFlags();
        res.status(200).json(featureFlags);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError) {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
}

async function getFlagById(req, res) {
    try {
        const featureFlag = await FeatureFlagService.getFlagById(req.params.id);
        res.status(200).json(featureFlag);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError) {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
}

async function getFlagByName(req, res) {
    try {
        const featureFlag = await FeatureFlagService.getFlagByName(req.params.name);
        res.status(200).json(featureFlag);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError) {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
}

async function getFlagsByAppName(req, res) {
    try {
        const featureFlags = await FeatureFlagService.getFlagsByAppName(req.params.appName);
        res.status(200).json(featureFlags);
    } catch (err) {
        console.error(err);
        if (err instanceof AppNotFoundError) {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
}

async function getFlagStateForFlagName(req, res) {
    try {
        const state = await FeatureFlagService.getFlagStateForName(req.body.flagName, req.body.appName, req.body.userId, req.body.environmentName);
        res.status(200).json(state);

    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError || err instanceof AppNotFoundError) {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
}

async function getFlagStatesForUserId(req, res) {
    try {
        const states = await FeatureFlagService.getFlagStatesForUserId(req.body.userId, req.body.appName, req.body.environmentName);
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError || err instanceof AppNotFoundError) {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
}

async function toggleFlag(req, res) {
    try {
        const featureFlag = await FeatureFlagService.toggleFlag(req.body.flagName, req.body.id, req.body.appName, req.body.environmentName);
        res.status(200).json(featureFlag);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError || 
            err instanceof AppNotFoundError || 
            err instanceof EnvironmentNotFoundError) {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
}

async function createFlag(req, res) {
    try {
        const featureFlag = await FeatureFlagService.createFlag(req.body.name, req.body.appName, req.body.environmentName);
        res.status(200).json(featureFlag);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError || 
            err instanceof AppNotFoundError || 
            err instanceof EnvironmentNotFoundError) {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
}


module.exports = {
    getAllFlags,
    getFlagById,
    getFlagByName,
    getFlagsByAppName,
    getFlagStateForFlagName,
    getFlagStatesForUserId,
    toggleFlag,
    createFlag
};