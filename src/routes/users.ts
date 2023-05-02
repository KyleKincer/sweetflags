import express from 'express';
import * as usersController from '../controllers/usersController';
import checkJwt from '../middleware/authMiddleware'

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
 *       security:
 *         - bearerAuth: []
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
router.get('/', checkJwt, usersController.getAllUsers);

/**
 * @swagger
 * paths:
 *   /api/users/{id}:
 *     get:
 *       summary: Return user data by user ID
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
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
router.get('/:id', checkJwt, usersController.getUserById);

/**
 * @swagger
 * paths:
 *   /api/users/app/{appId}:
 *     get:
 *       summary: Return user data for all users belonging to a specific app by app ID
 *       tags: [Users]
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
router.get('/app/:appId', checkJwt, usersController.getUsersByAppId);

/**
 * @swagger
 * /api/users/app/{appId}/{externalId}:
 *   get:
 *     summary: Get a user by appId and externalId
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the app associated with the user
 *       - in: path
 *         name: externalId
 *         schema:
 *           type: string
 *         required: true
 *         description: The external ID of the user
 *     responses:
 *       200:
 *         description: User data for the given appId and externalId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user with the given appId and externalId was not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'User not found'
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
router.get('/app/:appId/:externalId', checkJwt, usersController.getUserByAppIdAndExternalId);

/**
 * @swagger
 * paths:
 *   /api/users:
 *     post:
 *       summary: Create a new user
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
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
router.post('/', checkJwt, usersController.createUser);

/**
 * @swagger
 * paths:
 *   /api/users/{id}:
 *     put:
 *       summary: Update an existing user
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
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
router.put('/:id', checkJwt, usersController.updateUser);

/**
 * @swagger
 * paths:
 *   /api/users/{id}:
 *     delete:
 *       summary: Delete a user
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
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
router.delete('/:id', checkJwt, usersController.deleteUser);

export default router;