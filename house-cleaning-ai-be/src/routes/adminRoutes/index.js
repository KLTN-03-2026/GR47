import express from 'express';
import * as ClientController from '../../controllers/ClientController.js';
import * as AdminController from '../../controllers/AdminController.js';
import * as CleanerController from '../../controllers/CleanerController.js';
import * as AIConfigController from '../../controllers/AIConfigController.js';
import * as StatisficsController from '../../controllers/StatisticsController.js';
import * as BookingController from '../../controllers/BookingController.js';
import * as ComplaintController from '../../controllers/ComplaintController.js';

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
adminRouter.post('/reject-cleaner/:id', AdminMiddleware.protect, CleanerController.rejectCleaner);
adminRouter.post('/lock-and-unlock-cleaner/:id', AdminMiddleware.protect, CleanerController.lockAndUnlockCleaner);
adminRouter.post('/lock-and-unlock-client/:id', AdminMiddleware.protect, ClientController.lockAndUnlockClient);
adminRouter.get('/get-all-bookings', AdminMiddleware.protect, BookingController.getAllBookings)
// Complaint Management Routes
adminRouter.get('/complaints', AdminMiddleware.protect, ComplaintController.getAllComplaints);
adminRouter.patch('/complaints/:id/resolve', AdminMiddleware.protect, ComplaintController.resolveComplaint);
adminRouter.post('/complaints/:complaintId/penalize', AdminMiddleware.protect, ComplaintController.penalizeCleaner);
adminRouter.post('/complaints/:complaintId/refund', AdminMiddleware.protect, ComplaintController.refundClient);
adminRouter.post('/complaints/:complaintId/gift-promo', AdminMiddleware.protect, ComplaintController.giftPromotionCode);
adminRouter.post('/complaints/:complaintId/hide', AdminMiddleware.protect, ComplaintController.hideComplaint);
adminRouter.get('/complaints/:complaintId/history', AdminMiddleware.protect, ComplaintController.getComplaintHistory);

// Cleaner Penalty Routes
adminRouter.get('/cleaners/:cleanerId/penalties', AdminMiddleware.protect, ComplaintController.getCleanerPenalties);
adminRouter.get('/cleaners/:cleanerId/active-penalties', AdminMiddleware.protect, ComplaintController.getActiveCleanerPenalties);
adminRouter.post('/penalties/:penaltyId/lift', AdminMiddleware.protect, ComplaintController.liftPenalty);

// Promotion Code Routes
adminRouter.get('/clients/:clientId/promo-codes', AdminMiddleware.protect, ComplaintController.getClientPromoCodes);
adminRouter.post('/promo-codes/apply', AdminMiddleware.protect, ComplaintController.applyPromotionCode);

// adminRouter.get('/revenue-stastics', AdminMiddleware.protect, StatisficsController.getRevenueStatistics);
export default adminRouter;
