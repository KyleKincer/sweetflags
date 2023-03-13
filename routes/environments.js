const express = require('express');
const router = express.Router();
const environmentController = require('../controllers/environmentsController');

router.get('/', environmentController.getAllEnvironments);
router.get('/id/:id', environmentController.getEnvironmentById);
router.get('/:appName', environmentController.getEnvironmentsByAppName);

router.post('/', environmentController.createEnvironment);

module.exports = router;