import { Request, Response } from 'express';
import auditLogService from '../services/auditLogService';

async function getAllAuditLogs(req: Request, res: Response): Promise<void> {
    try {
        const data = await auditLogService.getAllAuditLogs(req.query.page as string, req.query.limit as string);
        res.status(200).json({data});
    } catch (err: unknown) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'An error occurred while fetching audit logs.' });
    }
};

export { getAllAuditLogs };