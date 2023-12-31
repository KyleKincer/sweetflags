import express from 'express';
import environmentsController from '../controllers/environmentsController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Environments
 *   description: Endpoints for managing environments
 */

/**
 * @swagger
 * paths:
 *   /api/environments:
 *     get:
 *       summary: Return all environments
 *       tags: [Environments]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: An array of environment objects
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Environment'
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
router.get('/', environmentsController.getAllEnvironments);

/**
 * @swagger
 * paths:
 *   /api/environments/{id}:
 *     get:
 *       summary: Return environment data for a given id
 *       tags: [Environments]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: Environment ID
 *       responses:
 *         200:
 *           description: An environment object
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Environment'
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
router.get('/:id', environmentsController.getEnvironmentById);

/**
 * @swagger
 * paths:
 *   /api/environments/app/{appId}:
 *     get:
 *       summary: Return environment data for all environments for a given app id
 *       tags: [Environments]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: appId
 *           schema:
 *             type: string
 *           required: true
 *           description: App ID
 *       responses:
 *         200:
 *           description: An array of environment objects
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Environment'
 *         404:
 *           description: Bad request
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: A message explaining the error
 *                     example: App 'AppName' not found
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
router.get('/app/:appId', environmentsController.getEnvironmentsByAppId)

/**
 * @swagger
 * paths:
 *   /api/environments/app/name/{appName}:
 *     get:
 *       summary: Return environment data for all environments for a given app name
 *       tags: [Environments]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: appName
 *           schema:
 *             type: string
 *           required: true
 *           description: App name
 *       responses:
 *         200:
 *           description: An array of environment objects
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Environment'
 *         404:
 *           description: Bad request
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: A message explaining the error
 *                     example: App 'AppName' not found
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
router.get('/app/name/:appName', environmentsController.getEnvironmentsByAppName);

/**
 * @swagger
 * paths:
 *   /api/environments:
 *     post:
 *       summary: Create a new environment
 *       tags: [Environments]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the environment
 *                   example: Development
 *                 description:
 *                   type: string
 *                   description: A description of the environment
 *                   example: Development environment
 *                 appId:
 *                   type: string
 *                   description: The ID of the app the environment is associated with
 *                   example: 6442ea44ce25a8db1e791403
 *                 isActive:
 *                   type: boolean
 *                   description: Whether the environment is active
 *                   default: true
 *                 createdBy:
 *                   type: string
 *                   description: The name of the user who created the environment
 *                   example: admin
 *       responses:
 *         201:
 *           description: The created environment object
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Environment'
 *         400:
 *           description: Bad request
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: A message explaining the error
 *                     example: App 'AppName' not found
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
router.post('/', environmentsController.createEnvironment);

/**
 * @swagger
 * /api/environments/{id}:
 *   delete:
 *     summary: Delete an environment by ID
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the environment to delete
 *     responses:
 *       200:
 *         description: The environment was deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Environment'
 *       404:
 *         description: Resource not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message explaining the error
 *                   example: Environment '{id}' not found
 *       500:
 *         description: An error occurred while deleting the environment.
 */
router.delete('/:id', environmentsController.deleteEnvironment);

export default router;