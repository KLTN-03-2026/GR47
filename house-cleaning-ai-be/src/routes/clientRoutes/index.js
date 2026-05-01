import express from 'express';
import multer from 'multer';
import * as ClientController from '../../controllers/ClientController.js';
import * as AIController from '../../controllers/AIController.js';
import * as ClientMiddleware from '../../middlewares/ClientMiddleware.js';
import * as BookingController from '../../controllers/BookingController.js';

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
clientRouter.get('/order-detail/:id', ClientMiddleware.protect, BookingController.getBookingDetailsById);
clientRouter.get('/my-bookings', ClientMiddleware.protect, BookingController.getMyBookings);

clientRouter.post('/analyze-room-image', ClientMiddleware.protect, upload.single('room_image'), AIController.analyzeRoomImage);

clientRouter.get('/get-my-profile', ClientMiddleware.protect, ClientController.getMyProfile);
clientRouter.post('/update-avatar/:id', ClientMiddleware.protect, upload.single('avatar'), ClientController.updateAvatar);
export default clientRouter;