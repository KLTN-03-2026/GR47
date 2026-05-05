import express from 'express';
import * as ClientController from '../../controllers/ClientController.js';
import * as AdminController from '../../controllers/AdminController.js';
import * as CleanerController from '../../controllers/CleanerController.js';
import * as AIConfigController from '../../controllers/AIConfigController.js';
import * as StatisficsController from '../../controllers/StatisticsController.js';
import * as BookingController from '../../controllers/BookingController.js';

import * as AdminMiddleware from '../../middlewares/AdminMiddleware.js';

const adminRouter = express.Router();

adminRouter.post('/login', AdminController.login);
adminRouter.post('/check-auth', AdminMiddleware.protect, AdminController.checkAuth);
adminRouter.get('/get-all-clients-full', AdminMiddleware.protect, ClientController.getAllClientsFull);
adminRouter.get('/get-all-cleaners-full', AdminMiddleware.protect, CleanerController.getAllCleanersFull);
adminRouter.get('/get-current-ai-config', AdminMiddleware.protect, AIConfigController.getCurrentAIConfig);
adminRouter.post('/update-ai-config', AdminMiddleware.protect, AIConfigController.updateAIConfig);
adminRouter.get('/get-config-history', AdminMiddleware.protect, AIConfigController.getConfigHistory);
adminRouter.get('/dashboard-stats', AdminMiddleware.protect, StatisficsController.getDashboardStats);
adminRouter.get('/get-all-pending-cleaners', AdminMiddleware.protect, CleanerController.getAllPendingCleaners);
adminRouter.post('/approve-cleaner/:id', AdminMiddleware.protect, CleanerController.approveCleaner);
adminRouter.post('/lock-and-unlock-cleaner/:id', AdminMiddleware.protect, CleanerController.lockAndUnlockCleaner);
adminRouter.post('/lock-and-unlock-client/:id', AdminMiddleware.protect, ClientController.lockAndUnlockClient);
adminRouter.get('/get-all-bookings', AdminMiddleware.protect, BookingController.getAllBookings)
// adminRouter.get('/revenue-stastics', AdminMiddleware.protect, StatisficsController.getRevenueStatistics);
export default adminRouter;