import express from 'express';
import * as appsController from '../controllers/appsController';

const router = express.Router();

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

/**
 * @swagger
 * paths:
 *   /api/apps/{id}:
 *     get:
 *       summary: Return app by ID
 *       tags: [Apps]
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: The app ID
 *       responses:
 *         200:
 *           description: An app object
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/App'
 *         404:
 *           description: App not found
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: A message explaining the error
 *                     example: App with id {id} not found
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
router.get('/:id', appsController.getAppById);

/**
 * @swagger
 * paths:
 *   /api/apps/name/{name}:
 *     get:
 *       summary: Return app by name
 *       tags: [Apps]
 *       parameters:
 *         - in: path
 *           name: name
 *           schema:
 *             type: string
 *           required: true
 *           description: The app name
 *       responses:
 *         200:
 *           description: An app object
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/App'
 *         404:
 *           description: App not found
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: A message explaining the error
 *                     example: App with name {name} not found
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
router.get('/name/:name', appsController.getAppByName);

/**
 * @swagger
 * paths:
 *   /api/apps:
 *     post:
 *       summary: Create a new app
 *       description: Creates a new app and default production environment.
 *       tags: [Apps]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - name
 *                 - createdBy
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the app
 *                 description:
 *                   type: string
 *                   description: The description of the app
 *                 isActive:
 *                   type: boolean
 *                   description: Whether the app is active or not
 *                   default: true
 *                 createdBy:
 *                   type: string
 *                   description: The user who created the app
 *       responses:
 *         201:
 *           description: App created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/App'
 *         500:
 *           description: Internal server error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Error message
 */
router.post('/', appsController.createApp);

export default router;