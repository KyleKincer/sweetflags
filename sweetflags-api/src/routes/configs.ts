import express from 'express';
import * as configsController from '../controllers/configsController';
import checkJwt from '../middleware/authMiddleware'

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Configs
 *   description: Endpoints for managing configs
 */

/**
 * @swagger
 * /api/configs:
 *   get:
 *     summary: Returns all config data
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An array of config objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Config'
 *       404:
 *         description: No configs were found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No configs found'
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
router.get('/', checkJwt, configsController.getAllConfigs);

/**
 * @swagger
 * /api/configs/{id}:
 *   get:
 *     summary: Returns config data for a given id
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the config to retrieve
 *     responses:
 *       200:
 *         description: Config data for the given ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Config'
 *       404:
 *         description: The config with the given id was not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Config {id} not found'
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
router.get('/:id', checkJwt, configsController.getConfigById);

/**
 * @swagger
 * /api/configs/name/{name}:
 *   get:
 *     summary: Returns config data for a given name
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the config to retrieve
 *     responses:
 *       200:
 *         description: The config object with the given name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Config'
 *       404:
 *         description: The config with the given name was not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Config {name} not found'
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
router.get('/name/:name', checkJwt, configsController.getConfigByName)

/**
 * @swagger
 * /api/configs/app/{appId}:
 *   get:
 *     summary: Returns all config data for a given app ID
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         description: The ID of the app to retrieve configs for
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An array of config objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Config'
 *       404:
 *         description: Invalid app ID provided or no configs found for the app
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining the issue with the request
 *               example:
 *                 message: App '1234' not found
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
router.get('/app/:appId', checkJwt, configsController.getConfigsByAppId)

/**
 * @swagger
 * /api/configs/app/name/{appName}:
 *   get:
 *     summary: Returns all config data for a given app name
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appName
 *         description: The name of the app to retrieve configs for
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An array of config objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Config'
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
router.get('/app/name/:appName', checkJwt, configsController.getConfigsByAppName)

/**
 * @swagger
 * /api/configs/state/id:
 *   post:
 *     summary: Returns the config state
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               configName:
 *                 type: string
 *               configId:
 *                 type: string
 *               userId:
 *                 type: string
 *               environmentId:
 *                 type: string
 *             required:
 *               - userId
 *               - environmentId
 *               - one of [configName, configId]
 *     responses:
 *       200:
 *         description: Config state for the given environment, user id, and flag name or flag id
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
 *         description: Config not found
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
router.post('/value/id', checkJwt, configsController.getConfigValue)

/**
* @swagger
* /api/configs/state/user:
*   post:
*     summary: Returns the state of all configs for a given user ID, app, and environment
*     tags: [Configs]
 *     security:
 *       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               appId:
*                 type: string
*                 description: The ID of the application
*                 example: 6442ea44ce25a8db1e791401
*               userId:
*                 type: string
*                 description: The ID of the user
*                 example: 123
*               environmentId:
*                 type: string
*                 description: The ID of the environment
*                 example: 6442ea44ce25a8db1e791403
*             required:
*               - appId
*               - userId
*               - environmentId
*     responses:
*       200:
*         description: Returns an object containing an array of config states for the given user
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 flags:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       id:
*                         type: string
*                         description: The ID of the config
*                         example: 6442ea44ce25a8db1e791402
*                       name:
*                         type: string
*                         description: The name of the config
*                         example: featureA
*                       isEnabled:
*                         type: boolean
*                         description: The state of the config for the given user
*                         example: true
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
router.post('/state/user', checkJwt, configsController.getConfigStatesForUserId)

/**
 * @swagger
 * paths:
 *   /api/configs/toggle:
 *     put:
 *       summary: Toggle a config state
 *       tags: [Configs]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the config to toggle
 *                 environmentId:
 *                   type: string
 *                   description: The id of the environment the config belongs to
 *                   required: true
 *                 updatedBy:
 *                   type: string
 *                   description: The name of the user who is updating the config
 *                   required: true
 *       responses:
 *         200:
 *           description: Config data for the updated record. 
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Config'
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
router.put('/toggle', checkJwt, configsController.toggleFlag);

// endpoint to enable flag by id in all environments with a single request including updatedBy
router.put('/enable', checkJwt, configsController.enableFlag);

// endpoint to disable flag in all environments
router.put('/disable', checkJwt, configsController.disableFlag);

/**
 * @swagger
 * paths:
 *   /api/configs/{id}/metadata:
 *     put:
 *       summary: Update a config's metadata
 *       tags: [Configs]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: The ID of the config to update
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The new name of the config
 *                 description:
 *                   type: string
 *                   description: The new description of the config
 *                 app:
 *                   type: string
 *                   description: The id of the application the config belongs to
 *                 updatedBy:
 *                   type: string
 *                   description: The name of the user who updates the flag
 *       responses:
 *         200:
 *           description: Config data for the updated record.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Config'
 *         404:
 *           description: The specified flag, application, or environment was not found
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
router.put('/:id/metadata', checkJwt, configsController.updateConfigMetadata)

/**
 * @swagger
 * /api/configs/{id}:
 *   put:
 *     summary: Update a config's state, evaluation strategy, and users for a given environment
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the config to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               environmentId:
 *                 type: string
 *                 description: The ID of the environment to update settings for
 *               isActive:
 *                 type: boolean
 *                 description: Indicates whether the config is active or not
 *               updatedBy:
 *                 type: string
 *                 description: The name of the user who updated the config
 *               evaluationStrategy:
 *                 type: string
 *                 enum: [BOOLEAN, PERCENTAGE, USER, PROBABILISTIC]
 *                 description: The evaluation strategy used for the config
 *               evaluationPercentage:
 *                 type: integer
 *                 description: The percentage of users that the config is enabled for. Required if evaluationStrategy is PERCENTAGE
 *               allowedUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The list of users who are allowed to see the config. Required if evaluationStrategy is USER
 *               disallowedUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The list of users who are not allowed to see the config. Required if evaluationStrategy is USER
 *             required:
 *               - environmentId
 *               - updatedBy
 *     responses:
 *       200:
 *         description: The config was updated successfully.
 *         content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Config'
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
 *                     example: Flag {id} not found
 *       500:
 *         description: An error occurred while updating the config.
 */
router.put('/:id', checkJwt, configsController.updateConfig)

/**
 * @swagger
 * /api/configs:
 *   post:
 *     summary: Create a new config
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               flagName:
 *                 type: string
 *                 description: The name of the config.
 *               description:
 *                 type: string
 *                 description: The description of the config.
 *               appName:
 *                 type: string
 *                 description: The name of the application associated with the config.
 *               isActive:
 *                 type: boolean
 *                 description: Indicates whether the config is active or not.
 *               evaluationStrategy:
 *                 type: string
 *                 enum: [BOOLEAN, PERCENTAGE, USER, PROBABILISTIC]
 *                 description: The evaluation strategy used for the config.
 *               evaluationPercentage:
 *                 type: integer
 *                 description: The percentage of users that the config is enabled for. Required if evaluationStrategy is PERCENTAGE.
 *               allowedUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The list of users who are allowed to see the config. Required if evaluationStrategy is USER.
 *               disallowedUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The list of users who are not allowed to see the config. Required if evaluationStrategy is USER.
 *               createdBy:
 *                 type: string
 *                 description: The name of the user who created the config.
 *             required:
 *               - name
 *               - app
 *               - isActive
 *               - evaluationStrategy
 *               - createdBy
 *     responses:
 *       201:
 *         description: The config was created successfully.
 *         content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Config'
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
 *         description: An error occurred while creating the config.
 */
router.post('/', checkJwt, configsController.createConfig);

/**
 * @swagger
 * /api/configs/{id}:
 *   delete:
 *     summary: Delete a config by ID
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the config to delete.
 *     responses:
 *       200:
 *         description: The config was deleted successfully.
 *         content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Config'
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
 *                     example: Flag '{id}' not found
 *       500:
 *         description: An error occurred while deleting the config.
 *         content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: A message explaining the error
 *                     example: An unknown error occurred
 */
router.delete('/:id', checkJwt, configsController.deleteConfig);

export default router;
