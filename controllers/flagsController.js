const FeatureFlag = require('../models/FeatureFlagModel');
const Environment = require('../models/EnvironmentModel');
const App = require('../models/AppModel');
const FeatureFlagService = require('../services/featureFlagService');
const mongoose = require('mongoose');

// Flag data (no states)

// GET /api/flags
// Return all feature flag data
async function getAllFlags(_req, res) {
    try {
        const featureFlags = await FeatureFlag.find();
        res.status(200).json(featureFlags);
      } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
      }
}

// GET /api/flags/id/:id
// Return feature flag data for a given id
async function getFlagById(req, res) {
    try {
        const featureFlag = await FeatureFlag.findById(req.params.id);
        res.status(200).json(featureFlag);
      } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
      }
}

// GET /api/flags/name/:name
// Return feature flag data for a given name
async function getFlagByName(req, res) {
    try {
        const featureFlag = await FeatureFlag.findOne({ name: req.params.name });
        res.status(200).json(featureFlag);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

// GET /api/flags/app/:appName
// Return feature flag data for all flags for a given app name
async function getFlagsByAppName(req, res) {
    try {
        const app = await App.findOne({ name: req.params.appName });

        if (!app) {
            return res.status(400).json({ message: `App '${req.params.appName}' not found` });
        }

        const featureFlags = await FeatureFlag.find({ app: app._id });
        res.status(200).json(featureFlags);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

// Flag states

// GET /api/flags/forFlagName
// Return feature flag state for a given app, environment name, user id, and flag name
/*
    {
        "appName": "myApp",
        "flagName": "myFlag",
        "userId": "123",
        "environmentName": "Production"
    }
*/
async function getFlagStateForFlagName(req, res) {
    try {
        const app = await App.findOne({ name: req.body.appName });

        if (!app) {
            return res.status(400).json({ message: `App '${req.body.appName}' not found` });
        }
        
        const featureFlag = await FeatureFlag.findOne({ app: app._id, name: req.body.flagName }).exec();

        if (!featureFlag) {
            return res.status(400).json({ message: `Flag '${req.body.flagName}' not found` });
        }

        const result = await FeatureFlagService.isEnabled(featureFlag, req.body.userId, req.body.environmentName);
        res.status(200).json(result);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
} 

// GET /api/flags/forUser
// Return feature flag states for all flags for a given app and environment name and user id
/*
    {
        "appName": "myApp",
        "userId": "123",
        "environmentName": "Production"
    }
*/
async function getFlagStatesForUserId(req, res) {
    try {
        const app = await App.findOne({ name: req.body.appName });

        if (!app) {
            return res.status(400).json({ message: `App '${req.body.appName}' not found` });
        }

        const featureFlags = await FeatureFlag.find({ app: app._id }).exec();
        const results = await FeatureFlagService.areEnabled(featureFlags, req.body.userId, req.body.environmentName);
        res.status(200).json(results);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

// PUT /api/toggle
// Toggle a feature flag state
/*
    {
        "id": "123", // either id or name is required
        "name": "myFlag",
        "appName": "myApp",
        "environmentName": "Production"
    }
*/
async function toggleFlag(req, res) {
    const app = await App.findOne({ name: req.body.appName }).exec();
    if (!app) {
        res.status(400).json({ message: `App ${req.body.appName} does not exist` });
        return;
    }

    const environment = await Environment.findOne({ app: app._id, name: req.body.environmentName }).exec();
    if (!environment) {
        res.status(400).json({ message: `Environment ${req.body.environmentName} does not exist` });
        return;
    }

    let featureFlag = {};
    if (req.body.id) {
        featureFlag = await FeatureFlag.findOne({ app: app._id, _id: req.body.id }).exec();
    } else if (req.body.name) {
        featureFlag = await FeatureFlag.findOne({ app: app._id, name: req.body.name }).exec();
    } else {
        res.status(400).json({ message: `Either the id or name property is required` });
        return;
    }

    if (!featureFlag) {
        res.status(400).json({ message: `Flag ${req.body.id || req.body.name} does not exist` });
        return;
    }

    const environments = featureFlag.environments;
    const environmentIndex = environments.findIndex(e => e.environment.toString() === environment._id.toString());
    if (environmentIndex === -1) {
        res.status(400).json({ message: `Flag ${req.body.id || req.body.name} does not exist for environment ${environment._id}` });
        return;
    } else {
        environments[environmentIndex].isActive = !environments[environmentIndex].isActive;
        featureFlag.environments = environments;
        await featureFlag.save();
        res.status(200).json(featureFlag);
    }
}

// POST /api/flags
// Create a new feature flag
/*
    {
        "name": "myFlag",
        "app": "myApp",
        "isActive": true,
        "evaluationStrategy": "PERCENTAGE/USER/IMMEDIATE",
        "evaluationPercentage": 50, // if evaluationStrategy is PERCENTAGE
        "allowedUsers": ["123", "456"], // if evaluationStrategy is USER
        "disallowedUsers": ["789"], // if evaluationStrategy is USER
        "createdBy": "me"
    }
*/
async function createFlag(req, res) {
    const app = await App.findOne({ name: req.body.app }).exec();
    if (!app) {
        res.status(400).json({ message: `App ${req.body.app} does not exist` });
        return;
    }

    const environments = await Environment.find({ app: app._id }).exec();
    if (!environments) {
        res.status(400).json({ message: `App ${req.body.app} does not have any environments` });
        return;
    }

    const environmentsArray = []
    environments.forEach((env) => {
        environmentsArray.push({
            environment: env._id,
            isActive: req.body.isActive,
            evaluationStrategy: req.body.evaluationStrategy,
            evaluationPercentage: req.body.evaluationPercentage,
            allowedUsers: req.body.allowedUsers,
            disallowedUsers: req.body.disallowedUsers
        });
    });

    const featureFlag = new FeatureFlag({
        name: req.body.name,
        description: req.body.description,
        app: app._id,
        environments: environmentsArray,
        createdBy: req.body.createdBy
    });

    FeatureFlag.create(featureFlag).then((result) => {
        res.status(201).json(result);
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ message: err.message });
    });
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