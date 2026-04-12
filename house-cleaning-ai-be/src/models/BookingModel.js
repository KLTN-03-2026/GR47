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
        enum: Object.values(BOOKING_STATUS), // Lấy tất cả giá trị từ utils
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
    Service_Date: {
        type: Date,
        required: [true, 'Vui lòng chọn ngày và giờ dọn dẹp']
    },
    Service_Address: {
        type: String,
        required: [true, 'Vui lòng nhập địa chỉ chính xác']
    },
    Notes: {
        type: String,
        trim: true,
        default: "" // Khách không ghi gì thì để trống
    }
}, {
    timestamps: true
});

export default mongoose.model('Booking', bookingSchema);