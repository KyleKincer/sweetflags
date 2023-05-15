import express from 'express';
import * as flagsController from '../controllers/flagsController';
import checkJwt from '../middleware/authMiddleware'

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Flags
 *   description: Endpoints for managing feature flags
 */

/**
 * @swagger
 * /api/flags:
 *   get:
 *     summary: Returns all feature flag data
 *     tags: [Flags]
 *     security:
 *       - bearerAuth: []
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
router.get('/', checkJwt, flagsController.getAllFlags);

/**
 * @swagger
 * /api/flags/{id}:
 *   get:
 *     summary: Returns feature flag data for a given id
 *     tags: [Flags]
 *     security:
 *       - bearerAuth: []
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
router.get('/:id', checkJwt, flagsController.getFlagById);

/**
 * @swagger
 * /api/flags/name/{name}:
 *   get:
 *     summary: Returns feature flag data for a given name
 *     tags: [Flags]
 *     security:
 *       - bearerAuth: []
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
router.get('/name/:name', checkJwt, flagsController.getFlagByName)

/**
 * @swagger
 * /api/flags/app/{appId}:
 *   get:
 *     summary: Returns all feature flag data for a given app ID
 *     tags: [Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         description: The ID of the app to retrieve feature flags for
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
 *         description: Invalid app ID provided or no flags found for the app
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
router.get('/app/:appId', checkJwt, flagsController.getFlagsByAppId)

/**
 * @swagger
 * /api/flags/app/name/{appName}:
 *   get:
 *     summary: Returns all feature flag data for a given app name
 *     tags: [Flags]
 *     security:
 *       - bearerAuth: []
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
router.get('/app/name/:appName', checkJwt, flagsController.getFlagsByAppName)

/**
 * @swagger
 * /api/flags/state/id:
 *   post:
 *     summary: Returns the feature flag state
 *     tags: [Flags]
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
 *               flagName:
 *                 type: string
 *               flagId:
 *                 type: string
 *               userId:
 *                 type: string
 *               environmentId:
 *                 type: string
 *             required:
 *               - appId
 *               - userId
 *               - environmentId
 *               - one of [flagName, flagId]
 *     responses:
 *       200:
 *         description: Feature flag state for the given app, environment, user id, and flag name or flag id
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
router.post('/state/id', checkJwt, flagsController.getFlagState)

/**
* @swagger
* /api/flags/state/user:
*   post:
*     summary: Returns the state of all feature flags for a given user ID, app, and environment
*     tags: [Flags]
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
*         description: Returns an object containing an array of feature flag states for the given user
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
*                         description: The ID of the feature flag
*                         example: 6442ea44ce25a8db1e791402
*                       name:
*                         type: string
*                         description: The name of the feature flag
*                         example: featureA
*                       isEnabled:
*                         type: boolean
*                         description: The state of the feature flag for the given user
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
router.post('/state/user', checkJwt, flagsController.getFlagStatesForUserId)

/**
 * @swagger
 * paths:
 *   /api/flags/toggle:
 *     put:
 *       summary: Toggle a feature flag state
 *       tags: [Flags]
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
 *                   description: The ID of the feature flag to toggle
 *                 environmentId:
 *                   type: string
 *                   description: The id of the environment the feature flag belongs to
 *                   required: true
 *                 updatedBy:
 *                   type: string
 *                   description: The name of the user who is updating the feature flag
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
router.put('/toggle', checkJwt, flagsController.toggleFlag);

// endpoint to enable flag by id in all environments with a single request including updatedBy
router.put('/enable', checkJwt, flagsController.enableFlag);

// endpoint to disable flag in all environments
router.put('/disable', checkJwt, flagsController.disableFlag);

/**
 * @swagger
 * paths:
 *   /api/flags/{id}/metadata:
 *     put:
 *       summary: Update a feature flag's metadata
 *       tags: [Flags]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: The ID of the feature flag to update
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The new name of the feature flag
 *                 description:
 *                   type: string
 *                   description: The new description of the feature flag
 *                 app:
 *                   type: string
 *                   description: The id of the application the feature flag belongs to
 *                 updatedBy:
 *                   type: string
 *                   description: The name of the user who updates the flag
 *       responses:
 *         200:
 *           description: Feature flag data for the updated record.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/FeatureFlag'
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
router.put('/:id/metadata', checkJwt, flagsController.updateFlagMetadata)

/**
 * @swagger
 * /api/flags/{id}:
 *   put:
 *     summary: Update a feature flag's state, evaluation strategy, and users for a given environment
 *     tags: [Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the feature flag to update
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
 *                 description: Indicates whether the feature flag is active or not
 *               updatedBy:
 *                 type: string
 *                 description: The name of the user who updated the feature flag
 *               evaluationStrategy:
 *                 type: string
 *                 enum: [BOOLEAN, PERCENTAGE, USER, PROBABILISTIC]
 *                 description: The evaluation strategy used for the feature flag
 *               evaluationPercentage:
 *                 type: integer
 *                 description: The percentage of users that the feature flag is enabled for. Required if evaluationStrategy is PERCENTAGE
 *               allowedUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The list of users who are allowed to see the feature flag. Required if evaluationStrategy is USER
 *               disallowedUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The list of users who are not allowed to see the feature flag. Required if evaluationStrategy is USER
 *             required:
 *               - environmentId
 *               - updatedBy
 *     responses:
 *       200:
 *         description: The feature flag was updated successfully.
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
 *                     example: Flag {id} not found
 *       500:
 *         description: An error occurred while updating the feature flag.
 */
router.put('/:id', checkJwt, flagsController.updateFlag)

/**
 * @swagger
 * /api/flags:
 *   post:
 *     summary: Create a new feature flag
 *     tags: [Flags]
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
 *                 description: The name of the feature flag.
 *               description:
 *                 type: string
 *                 description: The description of the feature flag.
 *               appName:
 *                 type: string
 *                 description: The name of the application associated with the feature flag.
 *               isActive:
 *                 type: boolean
 *                 description: Indicates whether the feature flag is active or not.
 *               evaluationStrategy:
 *                 type: string
 *                 enum: [BOOLEAN, PERCENTAGE, USER, PROBABILISTIC]
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
router.post('/', checkJwt, flagsController.createFlag);

/**
 * @swagger
 * /api/flags/{id}:
 *   delete:
 *     summary: Delete a feature flag by ID
 *     tags: [Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the feature flag to delete.
 *     responses:
 *       200:
 *         description: The feature flag was deleted successfully.
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
 *                     example: Flag '{id}' not found
 *       500:
 *         description: An error occurred while deleting the feature flag.
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
router.delete('/:id', checkJwt, flagsController.deleteFlag);

export default router;
