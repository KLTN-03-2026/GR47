import express from 'express';
import multer from 'multer';
import * as CleanerController from '../../controllers/CleanerController.js';
import * as BookingController from '../../controllers/BookingController.js';

import * as CleanerMiddleware from '../../middlewares/CleanerMiddleware.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

const cleanerRouter = express.Router();

cleanerRouter.post('/login', CleanerController.login);
cleanerRouter.get('/check-auth', CleanerMiddleware.protect, CleanerController.checkAuth);
cleanerRouter.post(
    '/register',
    upload.fields([
        { name: 'Selfie_Image', maxCount: 1 },
        { name: 'Identity_Card', maxCount: 1 }
    ]),
    CleanerController.register
);
cleanerRouter.get('/get-booking-waiting', CleanerMiddleware.protect, BookingController.getWaitingBookingsForCleaner);
cleanerRouter.get('/get-booking-detail-waiting/:id', CleanerMiddleware.protect, BookingController.getBookingDetailWaitingForCleaner);
cleanerRouter.post('/accept-booking/:id', CleanerMiddleware.protect, BookingController.acceptBooking);
cleanerRouter.get('/get-booking-detail/:id', CleanerMiddleware.protect, BookingController.getBookingDetailForCleaner);
cleanerRouter.get('/get-booking-in-progress', CleanerMiddleware.protect, BookingController.getInProgressBookingsForCleaner);
cleanerRouter.post('/check-in-and-check-out/:id', CleanerMiddleware.protect, BookingController.checkInAndCheckOut);
export default cleanerRouter;