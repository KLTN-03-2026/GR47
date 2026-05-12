import mongoose from 'mongoose';
import Booking from '../models/BookingModel.js';
import BookingRating from '../models/BookingRatingModel.js';
import BookingComplaint from '../models/BookingComplaintModel.js';
import { BOOKING_STATUS } from '../utils/statusUtils.js';

const isCompleted = (status) => Number(status) === Number(BOOKING_STATUS.COMPLETED);

const complaintPopulate = [
    { path: 'Booking_Id', select: 'Service_Date Service_Address Total_Amount Booking_Status Payment_Status' },
    { path: 'Client_Id', select: 'Full_Name Phone_Number Avatar' },
    { path: 'Cleaner_Id', select: 'Full_Name Phone_Number Avatar Rating' },
    { path: 'Rating_Id', select: 'Stars Comment Is_Hidden Created_Date' }
];

export const createCleanerComplaint = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const clientId = req.user?.id;
        const stars = Number(req.body?.stars);
        const comment = String(req.body?.comment || '').trim();
        const reason = String(req.body?.reason || '').trim();
        const detail = String(req.body?.detail || '').trim();

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: 'Mã đơn hàng không hợp lệ' });
        }
        if (!clientId) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
        }
        if (!stars || stars < 1 || stars > 5) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn đánh giá từ 1 đến 5 sao' });
        }
        if (!reason) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn lý do khiếu nại' });
        }
        if (comment.length > 300) {
            return res.status(400).json({ success: false, message: 'Bình luận không quá 300 ký tự' });
        }
        if (detail.length > 500) {
            return res.status(400).json({ success: false, message: 'Chi tiết khiếu nại không quá 500 ký tự' });
        }

        const booking = await Booking.findOne({ _id: bookingId, Client_Id: clientId }).populate('Cleaner_Id');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }
        if (!booking.Cleaner_Id) {
            return res.status(400).json({ success: false, message: 'Đơn hàng chưa có người dọn để khiếu nại' });
        }
        if (!isCompleted(booking.Booking_Status)) {
            return res.status(400).json({ success: false, message: 'Chỉ có thể khiếu nại sau khi đơn hàng hoàn thành' });
        }

        const existingComplaint = await BookingComplaint.findOne({ Booking_Id: bookingId });
        if (existingComplaint) {
            return res.status(400).json({ success: false, message: 'Đơn hàng này đã có khiếu nại' });
        }

        let rating = await BookingRating.findOne({ Booking_Id: bookingId });
        if (!rating) {
            rating = await BookingRating.create({
                Booking_Id: bookingId,
                Client_Id: clientId,
                Cleaner_Id: booking.Cleaner_Id._id,
                Stars: stars,
                Comment: comment,
                Created_Date: new Date(),
                Is_Editable: true
            });
            await Booking.findByIdAndUpdate(bookingId, { Rating_Id: rating._id });
        }

        const complaint = await BookingComplaint.create({
            Booking_Id: bookingId,
            Client_Id: clientId,
            Cleaner_Id: booking.Cleaner_Id._id,
            Rating_Id: rating._id,
            Stars: stars,
            Comment: comment,
            Reason: reason,
            Detail: detail
        });

        const populated = await BookingComplaint.findById(complaint._id).populate(complaintPopulate);

        return res.status(201).json({
            success: true,
            message: 'Đã gửi khiếu nại. Admin sẽ kiểm tra và phản hồi sớm.',
            data: populated
        });
    } catch (error) {
        console.error('createCleanerComplaint:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi tạo khiếu nại', error: error.message });
    }
};

export const getMyComplaintByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const clientId = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: 'Mã đơn hàng không hợp lệ' });
        }

        const complaint = await BookingComplaint.findOne({ Booking_Id: bookingId, Client_Id: clientId })
            .populate(complaintPopulate);

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Chưa có khiếu nại cho đơn hàng này' });
        }

        return res.status(200).json({ success: true, data: complaint });
    } catch (error) {
        console.error('getMyComplaintByBooking:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy khiếu nại', error: error.message });
    }
};

export const getAllComplaints = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status } = req.query;
        const query = {};

        if (status) query.Status = status;
        if (search) {
            query.$or = [
                { Reason: { $regex: search, $options: 'i' } },
                { Detail: { $regex: search, $options: 'i' } },
                { Comment: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [complaints, totalItems] = await Promise.all([
            BookingComplaint.find(query)
                .populate(complaintPopulate)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            BookingComplaint.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: complaints,
            pagination: {
                currentPage: Number(page),
                totalItems,
                totalPages: Math.ceil(totalItems / Number(limit)) || 1
            }
        });
    } catch (error) {
        console.error('getAllComplaints:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách khiếu nại', error: error.message });
    }
};

export const resolveComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { status = 'RESOLVED', adminNote = '', isRefunded, isReviewHidden } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Mã khiếu nại không hợp lệ' });
        }

        const complaint = await BookingComplaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khiếu nại' });
        }

        complaint.Status = ['RESOLVED', 'REJECTED', 'PENDING'].includes(status) ? status : 'RESOLVED';
        complaint.Admin_Note = String(adminNote || '').slice(0, 500);
        if (typeof isRefunded === 'boolean') complaint.Is_Refunded = isRefunded;
        if (typeof isReviewHidden === 'boolean') complaint.Is_Review_Hidden = isReviewHidden;
        complaint.Resolved_Date = complaint.Status === 'PENDING' ? null : new Date();
        await complaint.save();

        if (complaint.Rating_Id && typeof isReviewHidden === 'boolean') {
            await BookingRating.findByIdAndUpdate(complaint.Rating_Id, { Is_Hidden: isReviewHidden });
        }

        const populated = await BookingComplaint.findById(id).populate(complaintPopulate);
        return res.status(200).json({ success: true, message: 'Đã cập nhật khiếu nại', data: populated });
    } catch (error) {
        console.error('resolveComplaint:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật khiếu nại', error: error.message });
    }
};
