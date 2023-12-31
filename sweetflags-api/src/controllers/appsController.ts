import { Request, Response } from 'express';
import AppsService from '../services/appsService';
import { AppNotFoundError } from '../errors';
import { IAppInputDTO } from '../interfaces/IApp';

async function getAllApps(req: Request, res: Response): Promise<void> {
    const isActive = req.query.isActive as boolean | undefined;
    try {
        const apps = await AppsService.getAllApps(isActive);
        res.status(200).json(apps);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof AppNotFoundError) {
            res.status(err.statusCode).json({ message: err.message })
        }
        if (err instanceof Error) {
            res.status(500).json({ message: err.message })
        } else {
            res.status(500).json({ message: 'An unknown error occurred' })
        }
    }
}

async function getAppById(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;
    try {
        const app = await AppsService.getAppById(id);
        return res.status(200).json(app);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof AppNotFoundError) {
            return res.status(err.statusCode).json({ message: err.message })
        }
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message })
        } else {
            return res.status(500).json({ message: 'An unknown error occurred' })
        }
    }
}

async function getAppByName(req: Request, res: Response): Promise<void> {
    const name = req.params.name;
    try {
        const app = await AppsService.getAppByName(name);
        res.status(200).json(app);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof AppNotFoundError) {
            res.status(err.statusCode).json({ message: err.message })
        }
        if (err instanceof Error) {
            res.status(500).json({ message: err.message })
        } else {
            res.status(500).json({ message: 'An unknown error occurred' })
        }
    }
}

async function createApp(req: Request, res: Response): Promise<void> {
    const { name, description, isActive, createdBy } = req.body as IAppInputDTO;
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

async function deleteApp(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    try {
        await AppsService.deleteApp(id, req.body.updatedBy);
        res.status(204).send();
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof AppNotFoundError) {
            res.status(err.statusCode).json({ message: err.message })
        }
        if (err instanceof Error) {
            res.status(500).json({ message: err.message })
        } else {
            res.status(500).json({ message: 'An unknown error occurred' })
        }
    }
}

export {
    getAllApps,
    getAppById,
    getAppByName,
    createApp,
    deleteApp,
};
