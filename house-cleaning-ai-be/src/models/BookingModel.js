import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../utils/statusUtils.js';

const bookingSchema = new mongoose.Schema({
    Client_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    Cleaner_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cleaner',
        default: null
    },
    Total_Amount: {
        type: Number,
        required: true
    },
    Booking_Status: {
        type: String,
        enum: Object.values(BOOKING_STATUS),
        default: BOOKING_STATUS.WAITING
    },
    Payment_Status: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.UNPAID
    },
    Service_Date: {
        type: Date,
        required: true
    },
    Service_Address: {
        type: String,
        required: true
    },
    Notes: {
        type: String,
        trim: true,
        default: ""
    },
    Rating_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookingRating',
        default: null
    },
    /** Đã ghi nhận thu nhập cho cleaner khi đơn hoàn thành */
    Earnings_Settled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Booking', bookingSchema);