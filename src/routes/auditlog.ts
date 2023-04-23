import express from 'express';
import * as auditLogController from '../controllers/auditLogController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Audit Logs
 *   description: Endpoints for managing Audit Logs
 */

router.get('/', auditLogController.getAllAuditLogs);

export default router;