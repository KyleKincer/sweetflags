const express = require('express');
const router = express.Router();
const flagsController = require('../controllers/flagsController.js');


/**
 * @swagger
 * /api/flags:
 *   get:
 *     summary: Returns all feature flag data
 *     responses:
 *       200:
 *         description: An array of feature flag objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: No feature flags were found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No feature flags found'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining the issue with the server
 */
router.get('/', flagsController.getAllFlags);

/**
 * @swagger
 * /api/flags/id/{id}:
 *   get:
 *     summary: Returns feature flag data for a given id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the feature flag to retrieve
 *     responses:
 *       200:
 *         description: Feature flag data for the given ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: The feature flag with the given id was not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Flag {id} not found'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining the issue with the server
 */
router.get('/id/:id', flagsController.getFlagById);

/**
 * @swagger
 * /api/flags/name/{name}:
 *   get:
 *     summary: Returns feature flag data for a given name
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the feature flag to retrieve
 *     responses:
 *       200:
 *         description: The feature flag object with the given name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: The feature flag with the given name was not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Flag {name} not found'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining the issue with the server
 */
router.get('/name/:name', flagsController.getFlagByName)

/**
 * @swagger
 * /api/flags/app/{appName}:
 *   get:
 *     summary: Returns all feature flag data for a given app name
 *     parameters:
 *       - in: path
 *         name: appName
 *         description: The name of the app to retrieve feature flags for
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An array of feature flag objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Invalid app name provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining the issue with the request
 *               example:
 *                 message: App 'myapp' not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining the issue with the server
 */
router.get('/app/:appName', flagsController.getFlagsByAppName)

/**
 * @swagger
 * /api/flags/state/name:
 *   get:
 *     summary: Returns the feature flag state
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appName:
 *                 type: string
 *               flagName:
 *                 type: string
 *               userId:
 *                 type: string
 *               environmentName:
 *                 type: string
 *             required:
 *               - appName
 *               - flagName
 *               - userId
 *               - environmentName
 *     responses:
 *       200:
 *         description: Feature flag state for the given app, environment name, user id, and flag name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isEnabled:
 *                   type: boolean
 *               required:
 *                 - isEnabled
 *       404:
 *         description: App or flag not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               required:
 *                 - message
 */
router.get('/state/name', flagsController.getFlagStateForFlagName)

/**
 * @swagger
 * /api/flags/state/user:
 *   get:
 *     summary: Returns the state of all feature flags for a given user ID, app name, and environment name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appName:
 *                 type: string
 *                 description: The name of the application
 *                 example: myApp
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *                 example: 123
 *               environmentName:
 *                 type: string
 *                 description: The name of the environment
 *                 example: Production
 *             required:
 *               - appName
 *               - userId
 *               - environmentName
 *     responses:
 *       200:
 *         description: Returns an array of objects representing the state of each feature flag for the given user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the feature flag
 *                     example: featureA
 *                   isEnabled:
 *                     type: boolean
 *                     description: The state of the feature flag for the given user
 *                     example: true
 *       404:
 *         description: The specified app was not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message explaining the error
 *                   example: App 'myApp' not found
 *       500:
 *         description: An unexpected error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message explaining the error
 *                   example: Internal server error
 */
router.get('/user', flagsController.getFlagStatesForUserId)

/**
 * @swagger
 * paths:
 *   /api/toggle:
 *     put:
 *       summary: Toggle a feature flag state
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the feature flag to toggle
 *                 name:
 *                   type: string
 *                   description: The name of the feature flag to toggle
 *                 appName:
 *                   type: string
 *                   description: The name of the application the feature flag belongs to
 *                   required: true
 *                 environmentName:
 *                   type: string
 *                   description: The name of the environment the feature flag belongs to
 *                   required: true
 *       responses:
 *         200:
 *           description: Feature flag data for the updated record. 
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/FeatureFlag'
 *         404:
 *           description: The specified flag was not found
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: A message explaining the error
 *                     example: Flag 'myFlag' not found
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
router.put('/toggle', flagsController.toggleFlag);

/**
 * @swagger
 * /api/flags:
 *   post:
 *     summary: Create a new feature flag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the feature flag.
 *               app:
 *                 type: string
 *                 description: The name of the application associated with the feature flag.
 *               isActive:
 *                 type: boolean
 *                 description: Indicates whether the feature flag is active or not.
 *               evaluationStrategy:
 *                 type: string
 *                 enum: [IMMEDIATE, PERCENTAGE, USER, PROBABILISTIC]
 *                 description: The evaluation strategy used for the feature flag.
 *               evaluationPercentage:
 *                 type: integer
 *                 description: The percentage of users that the feature flag is enabled for. Required if evaluationStrategy is PERCENTAGE.
 *               allowedUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The list of users who are allowed to see the feature flag. Required if evaluationStrategy is USER.
 *               disallowedUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The list of users who are not allowed to see the feature flag. Required if evaluationStrategy is USER.
 *               createdBy:
 *                 type: string
 *                 description: The name of the user who created the feature flag.
 *             required:
 *               - name
 *               - app
 *               - isActive
 *               - evaluationStrategy
 *               - createdBy
 *     responses:
 *       201:
 *         description: The feature flag was created successfully.
 *         content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Resource not found. 
 *         content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: A message explaining the error
 *                     example: App {appName} not found
 *       500:
 *         description: An error occurred while creating the feature flag.
 */
router.post('/', flagsController.createFlag);

module.exports = router;
