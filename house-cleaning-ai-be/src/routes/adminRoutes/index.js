// src/routes/admin/index.js
import express from 'express';
import * as ClientController from '../../controllers/ClientController.js';
import * as AdminController from '../../controllers/AdminController.js';
import * as CleanerController from '../../controllers/CleanerController.js';

import * as AdminMiddleware from '../../middlewares/AdminMiddleware.js';

const adminRouter = express.Router();

adminRouter.post('/login', AdminController.login);
adminRouter.post('/check-auth', AdminMiddleware.protect, AdminController.checkAuth);
adminRouter.get('/get-all-clients-full', AdminMiddleware.protect, ClientController.getAllClientsFull);
adminRouter.get('/get-all-cleaners-full', AdminMiddleware.protect, CleanerController.getAllCleanersFull);

export default adminRouter;