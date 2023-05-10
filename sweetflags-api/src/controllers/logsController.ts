import { Request, Response } from 'express';
import LogsService from '../services/logsService';

async function getAllLogs(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const logs = await LogsService.getAllLogs(page, limit);
        res.status(200).json(logs);
    } catch (err: unknown) {
        console.error(err);
        res.status(500).json({ message: 'An unknown error occurred' })
    }
}

async function getLogsByTarget(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const target = req.params.target;
    try {
        const logs = await LogsService.getLogsByTarget(target, page, limit);
        res.status(200).json(logs);
    } catch (err: unknown) {
        console.error(err);
        res.status(500).json({ message: 'An unknown error occurred' })
    }
}

export { 
    getAllLogs,
    getLogsByTarget
};