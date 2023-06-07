import ConfigService from '../services/configService';
import { Request, Response } from 'express';
import { ConfigNotFoundError, AppNotFoundError, EnvironmentNotFoundError } from '../errors';

async function getAllConfigs(_req: Request, res: Response): Promise<void> {
    try {
        const configs = await ConfigService.getAllConfigs();
        res.status(200).json(configs);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof ConfigNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getConfigById(req: Request, res: Response): Promise<void> {
    try {
        const config = await ConfigService.getConfigById(req.params.id);
        res.status(200).json(config);
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof ConfigNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getConfigByName(req: Request, res: Response): Promise<void> {
    try {
        const config = await ConfigService.getConfigByName(req.params.name);
        res.status(200).json(config);
    } catch (err) {
        console.error(err);
        if (err instanceof ConfigNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getConfigsByAppId(req: Request, res: Response): Promise<void> {
    try {
        const configs = await ConfigService.getConfigsByAppId(req.params.appId);
        res.status(200).json(configs);
    } catch (err) {
        console.error(err);
        if (err instanceof AppNotFoundError || err instanceof ConfigNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getConfigsByAppName(req: Request, res: Response): Promise<void> {
    try {
        const configs = await ConfigService.getConfigsByAppName(req.params.appName);
        res.status(200).json(configs);
    } catch (err) {
        console.error(err);
        if (err instanceof AppNotFoundError || err instanceof ConfigNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getConfigValue(req: Request, res: Response): Promise<void> {
    try {
        const state = await ConfigService.getConfigValue(req.body.flagName, req.body.flagId, req.body.appId, req.body.userId, req.body.environmentId);
        res.status(200).json(state);

    } catch (err) {
        console.error(err);
        if (err instanceof ConfigNotFoundError || err instanceof AppNotFoundError) {
            res.status(err.statusCode).json({ message: err.message });
        } else if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

async function getConfigStatesForUserId(req: Request, res: Response): Promise<void> {
    try {
        const states = await ConfigService.getConfigStatesForUserId(req.body.appId, req.body.userId, req.body.environmentId);
        res.status(200).json(states);
    } catch (err) {
        console.error(err);
        if (err instanceof ConfigNotFoundError || err instanceof AppNotFoundError) {
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
        const featureFlag = await ConfigService.toggleFlag(req.body);
        res.status(200).json(featureFlag);
    } catch (err) {
        console.error(err);
        if (err instanceof ConfigNotFoundError || 
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
        const featureFlag = await ConfigService.enableForAllEnvironments(req.body)
        res.status(200).json(featureFlag)
    } catch (err) {
        console.error(err)
        if (err instanceof ConfigNotFoundError || 
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
        const featureFlag = await ConfigService.disableForAllEnvironments(req.body)
        res.status(200).json(featureFlag)
    } catch (err) {
        console.error(err)
        if (err instanceof ConfigNotFoundError ||
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

async function updateConfigMetadata(req: Request, res: Response): Promise<void> {
    try {
        const config = await ConfigService.updateConfigMetadata(
            req.params.id,
            req.body.name,
            req.body.description,
            req.body.app,
            req.body.updatedBy);
        res.status(200).json(config);
    } catch (err) {
        console.error(err);
        if (err instanceof ConfigNotFoundError || 
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

async function updateConfig(req: Request, res: Response): Promise<void> {
    try {
        const config = await ConfigService.updateConfig(req.params.id, req.body);
        res.status(200).json(config);
    } catch (err) {
        console.error(err);
        if (err instanceof ConfigNotFoundError || 
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

async function createConfig(req: Request, res: Response): Promise<void> {
    try {
        const config = await ConfigService.createConfig(req.body);
        res.status(201).json(config);
    } catch (err) {
        console.error(err);
        if (err instanceof ConfigNotFoundError || 
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

async function deleteConfig(req: Request, res: Response): Promise<void> {
    try {
        const config = await ConfigService.deleteConfig(req.params.id);
        res.status(200).json(config);
    } catch (err) {
        console.error(err);
        if (err instanceof ConfigNotFoundError ||
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
    getAllConfigs,
    getConfigById,
    getConfigByName,
    getConfigsByAppId,
    getConfigsByAppName,
    getConfigValue,
    getConfigStatesForUserId,
    toggleFlag,
    enableFlag,
    disableFlag,
    updateConfigMetadata,
    updateConfig as updateConfig,
    createConfig,
    deleteConfig,
};