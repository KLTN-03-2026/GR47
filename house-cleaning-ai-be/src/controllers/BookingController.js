import mongoose from 'mongoose';
import Booking from '../models/BookingModel.js';
import BookingDetail from '../models/BookingDetailModel.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../utils/statusUtils.js';

export const createBooking = async (req, res) => {
    try {
        // 1. LẤY ID TỪ TOKEN (Đã được middleware giải mã và gán vào req.user)
        // Tôi thêm console.log để ông soi tận mắt thằng Middleware nó gán cái gì vào nhé
        console.log(">>> Middleware trả về user:", req.user);

        // Thử đủ mọi kiểu tên mà các middleware hay dùng: _id, id, hoặc Client_Id
        const Client_Id = req.user?._id || req.user?.id || req.user?.Client_Id;

        if (!Client_Id) {
            return res.status(401).json({
                success: false,
                message: 'Ủa Token có mà sao không thấy ID? Check lại Middleware protect đi ba!'
            });
        }

        const {
            Total_Amount,
            Service_Date,
            Service_Address,
            Notes,
            Image_Url,
            Area_m2,
            Mess_Level,
            Price
        } = req.body;

        // 2. TẠO BOOKING (Bảng chính)
        const newBooking = await Booking.create({
            Client_Id, // Gán cái ID vừa lấy từ Token vào đây
            Total_Amount,
            Service_Date: new Date(Service_Date),
            Service_Address,
            Notes: Notes || "",
            Booking_Status: BOOKING_STATUS.WAITING,
            Payment_Status: PAYMENT_STATUS.UNPAID
        });

        // 3. TẠO BOOKING DETAIL (Bảng chi tiết AI)
        const newBookingDetail = await BookingDetail.create({
            Booking_Id: newBooking._id,
            Image_Url,
            Area_m2,
            Mess_Level,
            Price
        });

        return res.status(201).json({
            success: true,
            message: '🚀 Chốt đơn thành công! Đang đợi thợ nhận việc.',
            bookingId: newBooking._id
        });

    } catch (error) {
        console.error("❌ Lỗi lưu DB:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Lưu đơn hàng thất bại. Check lại logic DB.',
            error: error.message
        });
    }
};

// API lấy danh sách đơn hàng cho khách xem lại
export const getClientBookings = async (req, res) => {
    try {
        const Client_Id = req.user._id;

        // Populate để lấy luôn dữ liệu chi tiết AI và thông tin thợ (nếu có)
        const bookings = await Booking.find({ Client_Id })
            .sort({ createdAt: -1 })
            .populate('Cleaner_Id', 'Full_Name Phone_Number');

        return res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};