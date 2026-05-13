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
import PromotionCode from '../../models/PromotionCodeModel.js';

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
clientRouter.get('/promo-codes', ClientMiddleware.protect, async (req, res) => {
    try {
        const codes = await PromotionCode.find({
            Client_Id: req.user?.id,
            Is_Active: true,
            Is_Used: false,
            Expiry_Date: { $gt: new Date() }
        })
            .select('Code Discount_Percentage Max_Discount_Amount Expiry_Date Is_Used')
            .sort({ Expiry_Date: 1 });

        return res.status(200).json({
            success: true,
            data: codes.map((code) => ({
                _id: code._id,
                code: code.Code,
                discountPercentage: code.Discount_Percentage,
                maxDiscountAmount: code.Max_Discount_Amount,
                expiryDate: code.Expiry_Date,
                isUsed: code.Is_Used
            }))
        });
    } catch (error) {
        console.error('getClientPromoCodes:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

clientRouter.post('/promo-codes/validate', ClientMiddleware.protect, async (req, res) => {
    try {
        const { code, totalAmount } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập mã khuyến mãi' });
        }

        const promo = await PromotionCode.findOne({
            Code: String(code).trim().toUpperCase(),
            Client_Id: req.user?.id,
            Is_Active: true,
            Is_Used: false,
            Expiry_Date: { $gt: new Date() }
        });

        if (!promo) {
            return res.status(404).json({ success: false, message: 'Mã không hợp lệ hoặc đã hết hạn' });
        }

        const amount = Math.max(0, Math.floor(Number(totalAmount) || 0));
        const rawDiscount = Math.floor((amount * promo.Discount_Percentage) / 100);
        const discountAmount = promo.Max_Discount_Amount
            ? Math.min(rawDiscount, promo.Max_Discount_Amount)
            : rawDiscount;

        return res.status(200).json({
            success: true,
            data: {
                code: promo.Code,
                discountPercentage: promo.Discount_Percentage,
                maxDiscountAmount: promo.Max_Discount_Amount,
                discountAmount,
                finalAmount: Math.max(0, amount - discountAmount),
                expiryDate: promo.Expiry_Date
            }
        });
    } catch (error) {
        console.error('validatePromoCode:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

clientRouter.post('/promo-codes/apply', ClientMiddleware.protect, ComplaintController.applyPromotionCode);

clientRouter.get('/ipay-wallet', ClientMiddleware.protect, WalletController.getClientWallet);
clientRouter.post('/ipay-deposit', ClientMiddleware.protect, WalletController.depositClientWallet);
clientRouter.post('/ipay-withdraw', ClientMiddleware.protect, WalletController.withdrawClientWallet);
clientRouter.get('/ipay-transactions', ClientMiddleware.protect, WalletController.getClientWalletTransactions);

export default clientRouter;
