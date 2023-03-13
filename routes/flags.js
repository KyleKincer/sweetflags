const express = require('express');
const router = express.Router();
const flagsController = require('../controllers/flagsController.js');

// Get flag data
router.get('/', flagsController.getAllFlags);
router.get('/id/:id', flagsController.getFlagById);
router.get('/name/:name', flagsController.getFlagByName)
router.get('/app/:appName', flagsController.getFlagsByAppName)

// Get flag states
router.get('/forFlagName', flagsController.getFlagStateForFlagName)
router.get('/forUser', flagsController.getFlagStatesForUserId)

// Toggle flag state
router.put('/toggle', flagsController.toggleFlag);

// Create flag
router.post('/', flagsController.createFlag);

module.exports = router;
