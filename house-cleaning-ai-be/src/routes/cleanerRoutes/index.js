import express from 'express';
import * as CleanerController from '../../controllers/CleanerController.js';
import * as BookingController from '../../controllers/BookingController.js';

import * as CleanerMiddleware from '../../middlewares/CleanerMiddleware.js';

const cleanerRouter = express.Router();

cleanerRouter.post('/login', CleanerController.login);
cleanerRouter.get('/check-auth', CleanerMiddleware.protect, CleanerController.checkAuth);

cleanerRouter.get('/get-booking-waiting', CleanerMiddleware.protect, BookingController.getWaitingBookingsForCleaner);
cleanerRouter.get('/get-booking-detail-waiting/:id', CleanerMiddleware.protect, BookingController.getBookingDetailWaitingForCleaner);
cleanerRouter.post('/accept-booking/:id', CleanerMiddleware.protect, BookingController.acceptBooking);
cleanerRouter.get('/get-booking-detail/:id', CleanerMiddleware.protect, BookingController.getBookingDetailForCleaner);
cleanerRouter.get('/get-booking-in-progress', CleanerMiddleware.protect, BookingController.getInProgressBookingsForCleaner);
cleanerRouter.post('/check-in-and-check-out/:id', CleanerMiddleware.protect, BookingController.checkInAndCheckOut);
export default cleanerRouter;