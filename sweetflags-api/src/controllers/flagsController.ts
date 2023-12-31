import FeatureFlagService from '../services/featureFlagService';
import { Request, Response } from 'express';
import { FlagNotFoundError, AppNotFoundError, EnvironmentNotFoundError } from '../errors';

async function getAllFlags(_req: Request, res: Response): Promise<void> {
    try {
        const featureFlags = await FeatureFlagService.getAllFlags();
        res.status(200).json(featureFlags);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof FlagNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getFlagById(req: Request, res: Response): Promise<void> {
    try {
        const featureFlag = await FeatureFlagService.getFlagById(req.params.id);
        res.status(200).json(featureFlag);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof FlagNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getFlagByName(req: Request, res: Response): Promise<void> {
    try {
        const featureFlag = await FeatureFlagService.getFlagByName(req.params.name);
        res.status(200).json(featureFlag);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getFlagsByAppId(req: Request, res: Response): Promise<void> {
    try {
        const featureFlags = await FeatureFlagService.getFlagsByAppId(req.params.appId);
        res.status(200).json(featureFlags);
    } catch (err) {
        console.error(err);
        if (err instanceof AppNotFoundError || err instanceof FlagNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getFlagsByAppName(req: Request, res: Response): Promise<void> {
    try {
        const featureFlags = await FeatureFlagService.getFlagsByAppName(req.params.appName);
        res.status(200).json(featureFlags);
    } catch (err) {
        console.error(err);
        if (err instanceof AppNotFoundError || err instanceof FlagNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getFlagState(req: Request, res: Response): Promise<void> {
    try {
        const state = await FeatureFlagService.getFlagState(req.body.flagName, req.body.flagId, req.body.appId, req.body.userId, req.body.environmentId);
        res.status(200).json(state);

    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError || err instanceof AppNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getFlagStatesForUserId(req: Request, res: Response): Promise<void> {
    try {
        const states = await FeatureFlagService.getFlagStatesForUserId(req.body.appId, req.body.userId, req.body.environmentId);
        res.status(200).json(states);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError || err instanceof AppNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function toggleFlag(req: Request, res: Response): Promise<void> {
    try {
        const featureFlag = await FeatureFlagService.toggleFlag(req.body);
        res.status(200).json(featureFlag);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError || 
            err instanceof AppNotFoundError || 
            err instanceof EnvironmentNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function enableFlag(req: Request, res: Response): Promise<void> {
    try {
        const featureFlag = await FeatureFlagService.enableForAllEnvironments(req.body)
        res.status(200).json(featureFlag)
    } catch (err) {
        console.error(err)
        if (err instanceof FlagNotFoundError || 
            err instanceof AppNotFoundError || 
            err instanceof EnvironmentNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function disableFlag(req: Request, res: Response): Promise<void> {
    try {
        const featureFlag = await FeatureFlagService.disableForAllEnvironments(req.body)
        res.status(200).json(featureFlag)
    } catch (err) {
        console.error(err)
        if (err instanceof FlagNotFoundError ||
            err instanceof AppNotFoundError ||
            err instanceof EnvironmentNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message })
        } else {
            res.status(500).json({ message: 'An unknown error occurred' })
        }
    }
}

async function updateFlagMetadata(req: Request, res: Response): Promise<void> {
    try {
        const featureFlag = await FeatureFlagService.updateFlagMetadata(
            req.params.id,
            req.body.name,
            req.body.description,
            req.body.app,
            req.body.updatedBy);
        res.status(200).json(featureFlag);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError || 
            err instanceof AppNotFoundError || 
            err instanceof EnvironmentNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function updateFlag(req: Request, res: Response): Promise<void> {
    try {
        const featureFlag = await FeatureFlagService.updateFlag(req.params.id, req.body);
        res.status(200).json(featureFlag);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError || 
            err instanceof AppNotFoundError || 
            err instanceof EnvironmentNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function createFlag(req: Request, res: Response): Promise<void> {
    try {
        const featureFlag = await FeatureFlagService.createFlag(req.body);
        res.status(201).json(featureFlag);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError || 
            err instanceof AppNotFoundError || 
            err instanceof EnvironmentNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function deleteFlag(req: Request, res: Response): Promise<void> {
    try {
        const featureFlag = await FeatureFlagService.deleteFlag(req.params.id);
        res.status(200).json(featureFlag);
    } catch (err) {
        console.error(err);
        if (err instanceof FlagNotFoundError ||
            err instanceof AppNotFoundError ||
            err instanceof EnvironmentNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}


export {
    getAllFlags,
    getFlagById,
    getFlagByName,
    getFlagsByAppId,
    getFlagsByAppName,
    getFlagState,
    getFlagStatesForUserId,
    toggleFlag,
    enableFlag,
    disableFlag,
    updateFlagMetadata,
    updateFlag,
    createFlag,
    deleteFlag,
};