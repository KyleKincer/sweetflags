import UserService from '../services/usersService';
import { Request, Response } from 'express';

async function getAllUsers(req: Request, res: Response): Promise<void> {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getUserById(req: Request, res: Response): Promise<void> {
    try {
        const user = await UserService.getUserById(req.params.id);
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getUsersByAppId(req: Request, res: Response): Promise<void> {
    try {
        const users = await UserService.getUsersByAppId(req.params.appId);
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getUserByAppIdAndExternalId(req: Request, res: Response): Promise<void> {
    try {
        const user = await UserService.getUserByAppIdAndExternalId(req.params.appId, req.params.externalId);
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function createUser(req: Request, res: Response): Promise<void> {
    try {
        const user = await UserService.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function updateUser(req: Request, res: Response): Promise<void> {
    try {
        const user = await UserService.updateUser(req.params.id, req.body);
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function deleteUser(req: Request, res: Response): Promise<void> {
    try {
        const user = await UserService.deleteUser(req.params.id);
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

export {
    getAllUsers,
    getUserById,
    getUsersByAppId,
    getUserByAppIdAndExternalId,
    createUser,
    updateUser,
    deleteUser
}