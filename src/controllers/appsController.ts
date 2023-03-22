import { Request, Response } from 'express';
import AppsService from '../services/appsService';

interface CreateAppBody {
    name: string;
    description: string;
    isActive: boolean;
    createdBy: string;
}

async function getAllApps(req: Request, res: Response): Promise<void> {
    const isActive = req.query.isActive as boolean | undefined;
    try {
        const apps = await AppsService.getAllApps(isActive);
        res.status(200).json(apps);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
            res.status(500).json({ message: err.message })
        } else {
            res.status(500).json({ message: 'An unknown error occurred' })
        }
    }
}

async function createApp(req: Request, res: Response): Promise<void> {
    const { name, description, isActive, createdBy } = req.body as CreateAppBody;
    try {
        const app = await AppsService.createApp(name, description, isActive, createdBy);
        res.status(201).json(app);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
            res.status(500).json({ message: err.message })
        } else {
            res.status(500).json({ message: 'An unknown error occurred' })
        }
    }
}

export {
    getAllApps,
    createApp
};
