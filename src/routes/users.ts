import express from 'express';
import * as usersController from '../controllers/usersController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints for managing feature users
 */

/**
 * @swagger
 * paths:
 *   /api/users:
 *     get:
 *       summary: Return all users
 *       tags: [Users]
 *       responses:
 *         200:
 *           description: An array of user objects
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/User'
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
router.get('/', usersController.getAllUsers);

/**
 * @swagger
 * paths:
 *   /api/users/{id}:
 *     get:
 *       summary: Return user data by user ID
 *       tags: [Users]
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: User ID
 *       responses:
 *         200:
 *           description: A user object
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/User'
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
router.get('/:id', usersController.getUserById);

/**
 * @swagger
 * paths:
 *   /api/users/app/{appId}:
 *     get:
 *       summary: Return user data for all users belonging to a specific app by app ID
 *       tags: [Users]
 *       parameters:
 *         - in: path
 *           name: appId
 *           schema:
 *             type: string
 *           required: true
 *           description: App ID
 *       responses:
 *         200:
 *           description: An array of user objects
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/User'
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
router.get('/app/:appId', usersController.getUsersByAppId);

// get user by appid and externalid
router.get('/app/:appId/:externalId', usersController.getUserByAppIdAndExternalId);

/**
 * @swagger
 * paths:
 *   /api/users:
 *     post:
 *       summary: Create a new user
 *       tags: [Users]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInputDTO'
 *       responses:
 *         201:
 *           description: The created user object
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/User'
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
router.post('/', usersController.createUser);

/**
 * @swagger
 * paths:
 *   /api/users/{id}:
 *     put:
 *       summary: Update an existing user
 *       tags: [Users]
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: The user ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInputDTO'
 *       responses:
 *         200:
 *           description: The updated user object
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/User'
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
router.put('/:id', usersController.updateUser);

/**
 * @swagger
 * paths:
 *   /api/users/{id}:
 *     delete:
 *       summary: Delete a user
 *       tags: [Users]
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: The user ID
 *       responses:
 *         200:
 *           description: The deleted user object
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/User'
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
router.delete('/:id', usersController.deleteUser);

export default router;