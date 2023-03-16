const express = require('express');
const router = express.Router();
const appsController = require('../controllers/appsController.js');

/**
 * @swagger
 * tags:
 *   name: Apps
 *   description: Endpoints for managing apps
 */

/**
 * @swagger
 * paths:
 *   /api/apps:
 *     get:
 *       summary: Return all apps
 *       tags: [Apps]
 *       parameters:
 *         - in: query
 *           name: isActive
 *           schema:
 *             type: boolean
 *           description: Filter by active status
 *       responses:
 *         200:
 *           description: An array of app objects
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/App'
 *         500:
 *           description: An unexpected error occurred
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: A message explaining the error
 *                     example: Internal server error
 */
router.get('/', appsController.getAllApps);

router.post('/', appsController.createApp);

module.exports = router;