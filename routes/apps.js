const express = require('express');
const router = express.Router();
const appsController = require('../controllers/appsController.js');

router.get('/', appsController.getAllApps);

router.post('/', appsController.createApp);

module.exports = router;