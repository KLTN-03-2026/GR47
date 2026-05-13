import mongoose from 'mongoose';
import Booking from '../models/BookingModel.js';
import BookingDetail from '../models/BookingDetailModel.js';
import Cleaner from '../models/CleanerModel.js';
import WalletTransaction from '../models/WalletTransactionModel.js';
import { BOOKING_STATUS } from '../utils/statusUtils.js';
import { createNotification } from './notificationService.js';

/** Tỷ lệ thu nhập cleaner nhận khi đơn hoàn thành (sau phí nền tảng ẩn định) */
const CLEANER_INCOME_RATE = 0.9;

const isCompletedStatus = (s) =>
    s === BOOKING_STATUS.COMPLETED ||
    s === '4' ||
    Number(s) === Number(BOOKING_STATUS.COMPLETED);

/**
 * Ghi nhận một lần thu nhập cho cleaner khi đơn chuyển sang hoàn thành.
 * Idempotent nhờ cờ Earnings_Settled trên booking.
 */
export async function creditCleanerForCompletedBooking(bookingId) {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const booking = await Booking.findOne({
                _id: bookingId,
                Earnings_Settled: { $ne: true },
                Cleaner_Id: { $ne: null }
            }).session(session);

            if (!booking || !isCompletedStatus(booking.Booking_Status)) {
                return;
            }

            // Lấy thông tin chi tiết để lấy giá gốc (Price), đảm bảo thu nhập cleaner không bị giảm khi khách dùng khuyến mãi
            const bookingDetail = await BookingDetail.findOne({ Booking_Id: bookingId }).session(session);
            const basePrice = bookingDetail ? bookingDetail.Price : booking.Total_Amount;

            const gross = Math.max(0, Math.floor(Number(basePrice) || 0));
            const income = Math.floor(gross * CLEANER_INCOME_RATE);

            if (income > 0) {
                await Cleaner.findByIdAndUpdate(
                    booking.Cleaner_Id,
                    { $inc: { Wallet_Balance: income } },
                    { session }
                );
                await WalletTransaction.create(
                    [
                        {
                            User_Type: 'cleaner',
                            User_Id: booking.Cleaner_Id,
                            Category: 'INCOME',
                            Amount: income,
                            Description: `Thu nhập đơn #${String(booking._id).slice(-6).toUpperCase()}`,
                            Related_Booking_Id: booking._id
                        }
                    ],
                    { session }
                );
                await createNotification({
                    userType: 'cleaner',
                    userId: booking.Cleaner_Id,
                    title: 'Thu nhập đã được ghi nhận',
                    message: `Bạn nhận ${income.toLocaleString('vi-VN')}đ từ đơn #${String(booking._id).slice(-6).toUpperCase()}.`,
                    type: 'WALLET',
                    relatedBookingId: booking._id,
                    session
                });
            }

            booking.Earnings_Settled = true;
            await booking.save({ session });
        });
    } finally {
        await session.endSession();
    }
}
