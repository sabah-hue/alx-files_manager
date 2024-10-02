import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';


const router = Router();

// App Routers
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// User Routes
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

// Auth Routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// Files Routes
router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

export default router;
