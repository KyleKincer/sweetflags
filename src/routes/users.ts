import express from 'express';
import * as usersController from '../controllers/usersController';

const router = express.Router();

router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.get('/app/:appId', usersController.getUsersByAppId);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

export default router;