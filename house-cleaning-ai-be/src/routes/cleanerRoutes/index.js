import express from 'express';
import * as CleanerController from '../../controllers/CleanerController.js';

import * as CleanerMiddleware from '../../middlewares/CleanerMiddleware.js';

const cleanerRouter = express.Router();

cleanerRouter.post('/login', CleanerController.login);
cleanerRouter.get('/check-auth', CleanerMiddleware.protect, CleanerController.checkAuth);
export default cleanerRouter;