import { Request, Response } from 'express';
import EnvironmentsService from '../services/environmentsService';
import { EnvironmentNotFoundError, AppNotFoundError } from '../errors';

async function getAllEnvironments(_req: Request, res: Response): Promise<void> {
    try {
        const environments = await EnvironmentsService.getAllEnvironments();
        res.status(200).json(environments);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof EnvironmentNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getEnvironmentById(req: Request, res: Response): Promise<void> {
    try {
        const environment = await EnvironmentsService.getEnvironmentById(req.params.id);
        res.status(200).json(environment);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof EnvironmentNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getEnvironmentsByAppName(req: Request, res: Response): Promise<void> {
    try {
        const environments = await EnvironmentsService.getEnvironmentsByAppName(req.params.appName);
        res.status(200).json(environments);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof AppNotFoundError || err instanceof EnvironmentNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function createEnvironment(req: Request, res: Response): Promise<void> {
    const { name, description, appName, isActive, createdBy } = req.body;
    try {
        const environment = await EnvironmentsService.createEnvironment(name, description, appName, isActive, createdBy);
        res.status(201).json(environment);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof AppNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

export default {
    getAllEnvironments,
    getEnvironmentById,
    getEnvironmentsByAppName,
    createEnvironment
};
