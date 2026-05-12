import express from 'express';
import multer from 'multer';
import * as ClientController from '../../controllers/ClientController.js';
import * as AIController from '../../controllers/AIController.js';
import * as ClientMiddleware from '../../middlewares/ClientMiddleware.js';
import * as BookingController from '../../controllers/BookingController.js';
import * as RatingController from '../../controllers/RatingController.js';
import * as WalletController from '../../controllers/WalletController.js';
import * as ComplaintController from '../../controllers/ComplaintController.js';
import * as NotificationController from '../../controllers/NotificationController.js';

const clientRouter = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

clientRouter.post('/login', ClientController.login);
clientRouter.post('/register', ClientController.register);

clientRouter.post('/check-auth', ClientMiddleware.protect, ClientController.checkAuth);
clientRouter.get('/get-all-clients-full', ClientMiddleware.protect, ClientController.getAllClientsFull);
clientRouter.post('/create-booking', ClientMiddleware.protect, BookingController.createBooking)
clientRouter.post('/cancel-booking/:id', ClientMiddleware.protect, BookingController.cancelBookingByClient);
clientRouter.get('/order-detail/:id', ClientMiddleware.protect, BookingController.getBookingDetailsById);
clientRouter.get('/my-bookings', ClientMiddleware.protect, BookingController.getMyBookings);
clientRouter.post('/analyze-room-image', ClientMiddleware.protect, upload.single('room_image'), AIController.analyzeRoomImage);
clientRouter.get('/get-my-profile', ClientMiddleware.protect, ClientController.getMyProfile);
clientRouter.post('/update-avatar/:id', ClientMiddleware.protect, upload.single('avatar'), ClientController.updateAvatar);
clientRouter.post('/update-profile', ClientMiddleware.protect, ClientController.updateProfile);
clientRouter.post('/forget-password', ClientController.forgetPassword);
clientRouter.post('/reset-password', ClientController.resetPassword);
clientRouter.get('/get-my-addresses', ClientMiddleware.protect, ClientController.getMyAddresses);
clientRouter.post('/add-address', ClientMiddleware.protect, ClientController.addAddress);
clientRouter.post('/change-password', ClientMiddleware.protect, ClientController.changePassword);
clientRouter.post('/request-change-password-otp', ClientMiddleware.protect, ClientController.requestChangePasswordOTP);
clientRouter.get('/notifications', ClientMiddleware.protect, NotificationController.getMyNotifications);
clientRouter.patch('/notifications/read-all', ClientMiddleware.protect, NotificationController.markAllNotificationsRead);
clientRouter.patch('/notifications/:id/read', ClientMiddleware.protect, NotificationController.markNotificationRead);

// Rating Routes
clientRouter.post('/create-rating/:bookingId', ClientMiddleware.protect, RatingController.createRating);
clientRouter.get('/get-rating/:bookingId', ClientMiddleware.protect, RatingController.getRating);
clientRouter.patch('/update-rating/:ratingId', ClientMiddleware.protect, RatingController.updateRating);
clientRouter.delete('/delete-rating/:ratingId', ClientMiddleware.protect, RatingController.deleteRating);
clientRouter.get('/cleaner-ratings/:cleanerId', ClientMiddleware.protect, RatingController.getCleanerRatings);
clientRouter.post('/complaints/cleaner/:bookingId', ClientMiddleware.protect, ComplaintController.createCleanerComplaint);
clientRouter.get('/complaints/booking/:bookingId', ClientMiddleware.protect, ComplaintController.getMyComplaintByBooking);

// CleanAI iPay — ví khách hàng
clientRouter.get('/ipay-wallet', ClientMiddleware.protect, WalletController.getClientWallet);
clientRouter.post('/ipay-deposit', ClientMiddleware.protect, WalletController.depositClientWallet);
clientRouter.post('/ipay-withdraw', ClientMiddleware.protect, WalletController.withdrawClientWallet);
clientRouter.get('/ipay-transactions', ClientMiddleware.protect, WalletController.getClientWalletTransactions);

export default clientRouter;
