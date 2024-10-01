import { Router } from 'express';
import AppController from '../controllers/AppController';

const router = Router();

// App Routers
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default router;
