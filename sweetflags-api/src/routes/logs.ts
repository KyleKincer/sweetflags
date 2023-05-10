import express from 'express';
import * as logsController from '../controllers/logsController';
import checkJwt from '../middleware/authMiddleware'

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Endpoints for managing logs
 */

/**
 * @swagger
 * paths:
 *   /api/logs:
 *     get:
 *       summary: Get all logs
 *       description: Retrieves all logs ordered by createdAt descending and supports pagination.
 *       tags: [Logs]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *           required: false
 *           description: The page number to retrieve (default 1)
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *           required: false
 *           description: The number of logs to retrieve per page (default 10)
 *       responses:
 *         200:
 *           description: Logs retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   logs:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Log'
 *                   totalPages:
 *                     type: integer
 *                     description: Total number of pages
 *                   currentPage:
 *                     type: integer
 *                     description: Current page number
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
router.get('/', checkJwt, logsController.getAllLogs);

/**
 * @swagger
 * paths:
 *   /api/logs/{target}:
 *     get:
 *       summary: Get logs by target ID
 *       description: Retrieves logs for a specific target ID, sorted by the creation date in descending order. Supports pagination.
 *       tags: [Logs]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: target
 *           required: true
 *           schema:
 *             type: string
 *           description: The target ID to retrieve logs for
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *           description: The page number to fetch (default is 1)
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *           description: The number of logs per page (default is 10)
 *       responses:
 *         200:
 *           description: A list of logs and pagination information
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   logs:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Log'
 *                   totalPages:
 *                     type: integer
 *                     description: The total number of pages available
 *                   currentPage:
 *                     type: integer
 *                     description: The current page number
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
router.get('/:target', checkJwt, logsController.getLogsByTarget);


export default router;