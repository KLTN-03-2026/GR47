import express from 'express';
import multer from 'multer';
import * as CleanerController from '../../controllers/CleanerController.js';
import * as BookingController from '../../controllers/BookingController.js';
import * as RatingController from '../../controllers/RatingController.js';
import * as WalletController from '../../controllers/WalletController.js';

import * as CleanerMiddleware from '../../middlewares/CleanerMiddleware.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

const cleanerRouter = express.Router();

cleanerRouter.post('/login', CleanerController.login);
cleanerRouter.get('/check-auth', CleanerMiddleware.protect, CleanerController.checkAuth);
cleanerRouter.put(
    '/update-profile',
    CleanerMiddleware.protect,
    CleanerController.updateProfile
);
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
cleanerRouter.post('/cancel-booking/:id', CleanerMiddleware.protect, BookingController.cancelBookingByCleaner);

cleanerRouter.get('/get-rating/:bookingId', CleanerMiddleware.protect, RatingController.getRatingForCleaner);
cleanerRouter.patch('/reply-rating/:bookingId', CleanerMiddleware.protect, RatingController.replyToBookingRating);

cleanerRouter.get('/earning-wallet', CleanerMiddleware.protect, WalletController.getCleanerWallet);
cleanerRouter.post('/earning-withdraw', CleanerMiddleware.protect, WalletController.withdrawCleanerWallet);
cleanerRouter.get('/earning-transactions', CleanerMiddleware.protect, WalletController.getCleanerWalletTransactions);

export default cleanerRouter;