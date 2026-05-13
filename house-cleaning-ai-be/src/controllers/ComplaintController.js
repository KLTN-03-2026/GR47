import mongoose from 'mongoose';
import Booking from '../models/BookingModel.js';
import BookingRating from '../models/BookingRatingModel.js';
import BookingComplaint from '../models/BookingComplaintModel.js';
import CleanerPenalty from '../models/CleanerPenaltyModel.js';
import PromotionCode from '../models/PromotionCodeModel.js';
import ComplaintHistory from '../models/ComplaintHistoryModel.js';
import Client from '../models/ClientModel.js';
import Cleaner from '../models/CleanerModel.js';
import WalletTransaction from '../models/WalletTransactionModel.js';
import { BOOKING_STATUS } from '../utils/statusUtils.js';
import { createNotification } from '../services/notificationService.js';
import {
    logComplaintAction,
    calculatePenaltyEndDate,
    getPenaltyDurationText,
    sendComplaintActionNotifications,
    validatePromoCodeData,
    generatePromoCode
} from '../services/complaintService.js';

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

        await Promise.all([
            createNotification({
                userType: 'client',
                userId: clientId,
                title: 'Khiếu nại đã được gửi',
                message: `Khiếu nại cho đơn #${String(bookingId).slice(-6).toUpperCase()} đã được ghi nhận.`,
                type: 'COMPLAINT',
                relatedBookingId: bookingId
            }),
            createNotification({
                userType: 'cleaner',
                userId: booking.Cleaner_Id._id,
                title: 'Bạn có khiếu nại mới',
                message: `Khách hàng đã gửi khiếu nại cho đơn #${String(bookingId).slice(-6).toUpperCase()}.`,
                type: 'COMPLAINT',
                relatedBookingId: bookingId
            })
        ]);

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

export const getCleanerComplaintByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const cleanerId = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Mã đơn hàng không hợp lệ'
            });
        }

        const complaint = await BookingComplaint.findOne({
            Booking_Id: bookingId,
            Cleaner_Id: cleanerId
        }).populate(complaintPopulate);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Chưa có khiếu nại cho đơn hàng này'
            });
        }

        return res.status(200).json({
            success: true,
            data: complaint
        });

    } catch (error) {
        console.error('getCleanerComplaintByBooking:', error);

        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy khiếu nại',
            error: error.message
        });
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
        const adminId = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Mã khiếu nại không hợp lệ' });
        }

        const complaint = await BookingComplaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khiếu nại' });
        }

        const oldStatus = complaint.Status;
        complaint.Status = ['RESOLVED', 'REJECTED', 'PENDING'].includes(status) ? status : 'RESOLVED';
        complaint.Admin_Note = String(adminNote || '').slice(0, 500);
        if (typeof isRefunded === 'boolean') complaint.Is_Refunded = isRefunded;
        if (typeof isReviewHidden === 'boolean') complaint.Is_Review_Hidden = isReviewHidden;
        complaint.Resolved_Date = complaint.Status === 'PENDING' ? null : new Date();
        await complaint.save();

        if (complaint.Rating_Id && typeof isReviewHidden === 'boolean') {
            await BookingRating.findByIdAndUpdate(complaint.Rating_Id, { Is_Hidden: isReviewHidden });
        }

        // Log complaint action
        await logComplaintAction({
            complaintId: id,
            bookingId: complaint.Booking_Id,
            adminId,
            actionType: status === 'REJECTED' ? 'REJECT' : 'RESOLVE',
            oldValue: { Status: oldStatus },
            newValue: { Status: complaint.Status, Admin_Note: complaint.Admin_Note },
            description: `Khiếu nại được ${status === 'REJECTED' ? 'từ chối' : 'giải quyết'}`,
            notes: adminNote,
            isVisibleToClient: true,
            isVisibleToCleaner: true
        });

        const populated = await BookingComplaint.findById(id).populate(complaintPopulate);
        
        const notificationTitle = complaint.Status === 'REJECTED' ? 'Khiếu nại đã bị từ chối' : 'Khiếu nại đã được xử lý';
        const notificationMessage = `Khiếu nại cho đơn #${String(complaint.Booking_Id).slice(-6).toUpperCase()} đã được admin cập nhật.`;
        
        await sendComplaintActionNotifications({
            complaintId: id,
            bookingId: complaint.Booking_Id,
            clientId: complaint.Client_Id,
            cleanerId: complaint.Cleaner_Id,
            actionType: status === 'REJECTED' ? 'REJECT' : 'RESOLVE',
            title: notificationTitle,
            message: notificationMessage
        });

        return res.status(200).json({ success: true, message: 'Đã cập nhật khiếu nại', data: populated });
    } catch (error) {
        console.error('resolveComplaint:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật khiếu nại', error: error.message });
    }
};

/**
 * Penalize a cleaner for complaint
 */
export const penalizeCleaner = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { complaintId } = req.params;
        const { penaltyType, reason, note } = req.body;
        const adminId = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(complaintId)) {
            return res.status(400).json({ success: false, message: 'Mã khiếu nại không hợp lệ' });
        }

        // Validate penalty type
        const validPenalties = ['LOCK_5_MIN', 'LOCK_30_MIN', 'LOCK_1_HOUR', 'LOCK_6_HOUR', 'LOCK_24_HOUR', 'ACCOUNT_LOCK'];
        if (!validPenalties.includes(penaltyType)) {
            return res.status(400).json({ success: false, message: 'Loại xử phạt không hợp lệ' });
        }

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do xử phạt' });
        }

        const complaint = await BookingComplaint.findById(complaintId).session(session);
        if (!complaint) {
            await session.endSession();
            return res.status(404).json({ success: false, message: 'Không tìm thấy khiếu nại' });
        }

        const cleaner = await Cleaner.findById(complaint.Cleaner_Id).session(session);
        if (!cleaner) {
            await session.endSession();
            return res.status(404).json({ success: false, message: 'Không tìm thấy Cleaner' });
        }

        await session.withTransaction(async () => {
            let penaltyEndDate = null;
            
            if (penaltyType !== 'ACCOUNT_LOCK') {
                penaltyEndDate = calculatePenaltyEndDate(penaltyType);
            }

            const penalty = await CleanerPenalty.create(
                [{
                    Cleaner_Id: complaint.Cleaner_Id,
                    Booking_Id: complaint.Booking_Id,
                    Complaint_Id: complaintId,
                    Admin_Id: adminId,
                    Penalty_Type: penaltyType,
                    Reason: reason,
                    Note: note || '',
                    Penalty_End_Date: penaltyEndDate
                }],
                { session }
            );

            await logComplaintAction({
                complaintId,
                bookingId: complaint.Booking_Id,
                adminId,
                actionType: 'PENALIZE',
                newValue: { Penalty_Type: penaltyType, Penalty_End_Date: penaltyEndDate },
                description: `Xử phạt Cleaner: ${getPenaltyDurationText(penaltyType)}`,
                additionalData: { Penalty_Id: penalty[0]._id },
                notes: note || '',
                isVisibleToClient: true,
                isVisibleToCleaner: true,
                session
            });

            // Send notifications
            await Promise.all([
                createNotification({
                    userType: 'client',
                    userId: complaint.Client_Id,
                    title: 'Cleaner đã bị xử phạt',
                    message: `Cleaner liên quan đến đơn #${String(complaint.Booking_Id).slice(-6).toUpperCase()} đã bị xử phạt.`,
                    type: 'COMPLAINT',
                    relatedBookingId: complaint.Booking_Id,
                    session
                }),
                createNotification({
                    userType: 'cleaner',
                    userId: complaint.Cleaner_Id,
                    title: 'Bạn đã bị xử phạt',
                    message: `Bạn đã bị xử phạt do khiếu nại từ khách hàng. Lý do: ${reason}`,
                    type: 'COMPLAINT',
                    relatedBookingId: complaint.Booking_Id,
                    session
                })
            ]);
        });

        const populated = await BookingComplaint.findById(complaintId).populate(complaintPopulate);
        return res.status(200).json({
            success: true,
            message: `Đã xử phạt Cleaner: ${getPenaltyDurationText(penaltyType)}`,
            data: populated
        });
    } catch (error) {
        console.error('penalizeCleaner:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi xử phạt Cleaner', error: error.message });
    } finally {
        await session.endSession();
    }
};

/**
 * Refund money to client
 */
export const refundClient = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { complaintId } = req.params;
        const { amount, reason, note } = req.body;
        const adminId = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(complaintId)) {
            return res.status(400).json({ success: false, message: 'Mã khiếu nại không hợp lệ' });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Số tiền hoàn lại phải lớn hơn 0' });
        }

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do hoàn tiền' });
        }

        const complaint = await BookingComplaint.findById(complaintId).session(session);
        if (!complaint) {
            await session.endSession();
            return res.status(404).json({ success: false, message: 'Không tìm thấy khiếu nại' });
        }

        const booking = await Booking.findById(complaint.Booking_Id).session(session);
        if (!booking) {
            await session.endSession();
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const client = await Client.findById(complaint.Client_Id).session(session);
        if (!client) {
            await session.endSession();
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
        }

        await session.withTransaction(async () => {
            // Add refund amount to client wallet
            client.IPay_Balance = (client.IPay_Balance || 0) + amount;
            await client.save({ session });

            // Create wallet transaction
            await WalletTransaction.create(
                [{
                    User_Type: 'client',
                    User_Id: complaint.Client_Id,
                    Category: 'REFUND',
                    Amount: amount,
                    Description: `Hoàn tiền cho khiếu nại đơn #${String(complaint.Booking_Id).slice(-6).toUpperCase()}`,
                    Related_Booking_Id: complaint.Booking_Id
                }],
                { session }
            );

            // Update complaint
            complaint.Is_Refunded = true;
            await complaint.save({ session });

            // Log action
            await logComplaintAction({
                complaintId,
                bookingId: complaint.Booking_Id,
                adminId,
                actionType: 'REFUND',
                newValue: { Amount: amount, Is_Refunded: true },
                description: `Hoàn tiền: ${amount.toLocaleString('vi-VN')}đ`,
                additionalData: { Refund_Amount: amount },
                notes: note || '',
                isVisibleToClient: true,
                isVisibleToCleaner: true,
                session
            });

            // Send notifications
            await Promise.all([
                createNotification({
                    userType: 'client',
                    userId: complaint.Client_Id,
                    title: 'Hoàn tiền thành công',
                    message: `Bạn đã được hoàn ${amount.toLocaleString('vi-VN')}đ cho đơn #${String(complaint.Booking_Id).slice(-6).toUpperCase()}. Tiền đã cộng vào ví CleanAI iPay.`,
                    type: 'COMPLAINT',
                    relatedBookingId: complaint.Booking_Id,
                    session
                }),
                createNotification({
                    userType: 'cleaner',
                    userId: complaint.Cleaner_Id,
                    title: 'Khiếu nại được hoàn tiền',
                    message: `Khách hàng đã được hoàn tiền cho khiếu nại đơn #${String(complaint.Booking_Id).slice(-6).toUpperCase()}.`,
                    type: 'COMPLAINT',
                    relatedBookingId: complaint.Booking_Id,
                    session
                })
            ]);
        });

        const populated = await BookingComplaint.findById(complaintId).populate(complaintPopulate);
        return res.status(200).json({
            success: true,
            message: `Đã hoàn tiền ${amount.toLocaleString('vi-VN')}đ cho khách hàng`,
            data: populated
        });
    } catch (error) {
        console.error('refundClient:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi hoàn tiền', error: error.message });
    } finally {
        await session.endSession();
    }
};

/**
 * Gift promotion code to client
 */
export const giftPromotionCode = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { complaintId } = req.params;
        const { discountPercentage, maxDiscountAmount, expiryDate, reason, note } = req.body;
        const adminId = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(complaintId)) {
            return res.status(400).json({ success: false, message: 'Mã khiếu nại không hợp lệ' });
        }

        const validationErrors = validatePromoCodeData(discountPercentage, maxDiscountAmount, expiryDate);
        if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, message: validationErrors.join(', ') });
        }

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do tặng mã' });
        }

        const complaint = await BookingComplaint.findById(complaintId).session(session);
        if (!complaint) {
            await session.endSession();
            return res.status(404).json({ success: false, message: 'Không tìm thấy khiếu nại' });
        }

        const client = await Client.findById(complaint.Client_Id).session(session);
        if (!client) {
            await session.endSession();
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
        }

        let promoCode = '';
        let createdPromo = null;

        await session.withTransaction(async () => {
            promoCode = generatePromoCode();

            const promo = await PromotionCode.create(
                [{
                    Code: promoCode,
                    Client_Id: complaint.Client_Id,
                    Booking_Id: complaint.Booking_Id,
                    Complaint_Id: complaintId,
                    Admin_Id: adminId,
                    Discount_Percentage: discountPercentage,
                    Max_Discount_Amount: maxDiscountAmount || null,
                    Reason: reason,
                    Note: note || '',
                    Expiry_Date: new Date(expiryDate)
                }],
                { session }
            );
            createdPromo = promo[0];

            await logComplaintAction({
                complaintId,
                bookingId: complaint.Booking_Id,
                adminId,
                actionType: 'GIFT_PROMO',
                newValue: { Code: promoCode, Discount_Percentage: discountPercentage },
                description: `Tặng mã khuyến mãi: ${promoCode} - Giảm ${discountPercentage}%`,
                additionalData: { Promo_Id: promo[0]._id, Code: promoCode },
                notes: note || '',
                isVisibleToClient: true,
                isVisibleToCleaner: true,
                session
            });

            await Promise.all([
                createNotification({
                    userType: 'client',
                    userId: complaint.Client_Id,
                    title: 'Nhận mã khuyến mãi',
                    message: `Bạn đã nhận mã khuyến mãi ${promoCode} (giảm ${discountPercentage}%). Hết hạn: ${new Date(expiryDate).toLocaleDateString('vi-VN')}`,
                    type: 'COMPLAINT',
                    relatedBookingId: complaint.Booking_Id,
                    session
                }),
                createNotification({
                    userType: 'cleaner',
                    userId: complaint.Cleaner_Id,
                    title: 'Khách hàng nhận mã khuyến mãi',
                    message: `Khách hàng của đơn #${String(complaint.Booking_Id).slice(-6).toUpperCase()} đã nhận mã khuyến mãi.`,
                    type: 'COMPLAINT',
                    relatedBookingId: complaint.Booking_Id,
                    session
                })
            ]);
        });

        const populated = await BookingComplaint.findById(complaintId).populate(complaintPopulate);
        return res.status(200).json({
            success: true,
            message: `Đã tặng mã khuyến mãi ${promoCode}`,
            data: {
                complaint: populated,
                promoCode: createdPromo
            }
        });
    } catch (error) {
        console.error('giftPromotionCode:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi tặng mã khuyến mãi', error: error.message });
    } finally {
        await session.endSession();
    }
};

/**
 * Hide/Delete complaint from client and cleaner view
 */
export const hideComplaint = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { complaintId } = req.params;
        const { reason, note } = req.body;
        const adminId = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(complaintId)) {
            return res.status(400).json({ success: false, message: 'Mã khiếu nại không hợp lệ' });
        }

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do ẩn khiếu nại' });
        }

        const complaint = await BookingComplaint.findById(complaintId).session(session);
        if (!complaint) {
            await session.endSession();
            return res.status(404).json({ success: false, message: 'Không tìm thấy khiếu nại' });
        }

        await session.withTransaction(async () => {
            complaint.Is_Hidden = true;
            await complaint.save({ session });

            await logComplaintAction({
                complaintId,
                bookingId: complaint.Booking_Id,
                adminId,
                actionType: 'HIDE',
                oldValue: { Is_Hidden: false },
                newValue: { Is_Hidden: true },
                description: `Ẩn khiếu nại từ Client và Cleaner`,
                notes: note || '',
                session
            });

            // Notify client and cleaner that complaint is hidden
            await Promise.all([
                createNotification({
                    userType: 'client',
                    userId: complaint.Client_Id,
                    title: 'Khiếu nại đã bị ẩn',
                    message: `Khiếu nại cho đơn #${String(complaint.Booking_Id).slice(-6).toUpperCase()} đã bị ẩn. Lý do: ${reason}`,
                    type: 'COMPLAINT',
                    relatedBookingId: complaint.Booking_Id,
                    session
                }),
                createNotification({
                    userType: 'cleaner',
                    userId: complaint.Cleaner_Id,
                    title: 'Khiếu nại đã bị ẩn',
                    message: `Khiếu nại cho đơn #${String(complaint.Booking_Id).slice(-6).toUpperCase()} đã bị ẩn.`,
                    type: 'COMPLAINT',
                    relatedBookingId: complaint.Booking_Id,
                    session
                })
            ]);
        });

        const populated = await BookingComplaint.findById(complaintId).populate(complaintPopulate);
        return res.status(200).json({
            success: true,
            message: 'Đã ẩn khiếu nại',
            data: populated
        });
    } catch (error) {
        console.error('hideComplaint:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi ẩn khiếu nại', error: error.message });
    } finally {
        await session.endSession();
    }
};

/**
 * Get complaint history/logs
 */
export const getComplaintHistory = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(complaintId)) {
            return res.status(400).json({ success: false, message: 'Mã khiếu nại không hợp lệ' });
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [history, totalItems] = await Promise.all([
            ComplaintHistory.find({ Complaint_Id: complaintId })
                .populate('Admin_Id', 'Full_Name Email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            ComplaintHistory.countDocuments({ Complaint_Id: complaintId })
        ]);

        return res.status(200).json({
            success: true,
            data: history,
            pagination: {
                currentPage: Number(page),
                totalItems,
                totalPages: Math.ceil(totalItems / Number(limit)) || 1
            }
        });
    } catch (error) {
        console.error('getComplaintHistory:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch sử khiếu nại', error: error.message });
    }
};

/**
 * Get cleaner penalties
 */
export const getCleanerPenalties = async (req, res) => {
    try {
        const { cleanerId } = req.params;
        const { page = 1, limit = 20, isActive = true } = req.query;

        if (!mongoose.Types.ObjectId.isValid(cleanerId)) {
            return res.status(400).json({ success: false, message: 'Mã Cleaner không hợp lệ' });
        }

        const query = { Cleaner_Id: cleanerId };
        if (isActive !== 'all') {
            query.Is_Active = isActive === 'true' || isActive === true;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [penalties, totalItems] = await Promise.all([
            CleanerPenalty.find(query)
                .populate([
                    { path: 'Booking_Id', select: 'Service_Date Total_Amount' },
                    { path: 'Admin_Id', select: 'Full_Name Email' },
                    { path: 'Complaint_Id', select: 'Reason' }
                ])
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            CleanerPenalty.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: penalties,
            pagination: {
                currentPage: Number(page),
                totalItems,
                totalPages: Math.ceil(totalItems / Number(limit)) || 1
            }
        });
    } catch (error) {
        console.error('getCleanerPenalties:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch sử xử phạt', error: error.message });
    }
};

/**
 * Get active penalties for a cleaner (for booking validation)
 */
export const getActiveCleanerPenalties = async (req, res) => {
    try {
        const { cleanerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cleanerId)) {
            return res.status(400).json({ success: false, message: 'Mã Cleaner không hợp lệ' });
        }

        const now = new Date();
        const activePenalties = await CleanerPenalty.find({
            Cleaner_Id: cleanerId,
            Is_Active: true,
            $or: [
                { Penalty_End_Date: { $gt: now } },
                { Penalty_Type: 'ACCOUNT_LOCK' }
            ]
        });

        return res.status(200).json({
            success: true,
            data: activePenalties,
            isBlocked: activePenalties.length > 0
        });
    } catch (error) {
        console.error('getActiveCleanerPenalties:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

/**
 * Lift a penalty
 */
export const liftPenalty = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { penaltyId } = req.params;
        const { reason, note } = req.body;
        const adminId = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(penaltyId)) {
            return res.status(400).json({ success: false, message: 'Mã xử phạt không hợp lệ' });
        }

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do hủy xử phạt' });
        }

        const penalty = await CleanerPenalty.findById(penaltyId).session(session);
        if (!penalty) {
            await session.endSession();
            return res.status(404).json({ success: false, message: 'Không tìm thấy xử phạt' });
        }

        await session.withTransaction(async () => {
            penalty.Is_Active = false;
            penalty.Lifted_At = new Date();
            penalty.Lifted_Reason = reason;
            await penalty.save({ session });

            await logComplaintAction({
                complaintId: penalty.Complaint_Id,
                bookingId: penalty.Booking_Id,
                adminId,
                actionType: 'LIFT_PENALTY',
                oldValue: { Is_Active: true, Penalty_Type: penalty.Penalty_Type },
                newValue: { Is_Active: false },
                description: `Hủy xử phạt: ${getPenaltyDurationText(penalty.Penalty_Type)}`,
                notes: note || '',
                session
            });

            await createNotification({
                userType: 'cleaner',
                userId: penalty.Cleaner_Id,
                title: 'Xử phạt đã bị hủy',
                message: `Xử phạt của bạn đã bị hủy. Lý do: ${reason}`,
                type: 'COMPLAINT',
                relatedBookingId: penalty.Booking_Id,
                session
            });
        });

        const updated = await CleanerPenalty.findById(penaltyId);
        return res.status(200).json({
            success: true,
            message: 'Đã hủy xử phạt',
            data: updated
        });
    } catch (error) {
        console.error('liftPenalty:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi hủy xử phạt', error: error.message });
    } finally {
        await session.endSession();
    }
};

/**
 * Get promotion codes for a client
 */
export const getClientPromoCodes = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { includeUsed = false } = req.query;

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ success: false, message: 'Mã khách hàng không hợp lệ' });
        }

        const query = {
            Client_Id: clientId,
            Is_Active: true,
            Expiry_Date: { $gt: new Date() }
        };

        if (includeUsed !== 'true') {
            query.Is_Used = false;
        }

        const codes = await PromotionCode.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: codes
        });
    } catch (error) {
        console.error('getClientPromoCodes:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

/**
 * Apply promotion code to booking
 */
export const applyPromotionCode = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { code, bookingId } = req.body;
        const clientId = req.user?.id;

        if (!code || code.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập mã khuyến mãi' });
        }

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: 'Mã đơn hàng không hợp lệ' });
        }

        const promo = await PromotionCode.findOne({
            Code: code.toUpperCase(),
            Client_Id: clientId,
            Is_Active: true,
            Is_Used: false,
            Expiry_Date: { $gt: new Date() }
        }).session(session);

        if (!promo) {
            await session.endSession();
            return res.status(404).json({ success: false, message: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn' });
        }

        await session.withTransaction(async () => {
            promo.Is_Used = true;
            promo.Used_At = new Date();
            promo.Used_For_Booking_Id = bookingId;
            await promo.save({ session });
        });

        const booking = await Booking.findById(bookingId);
        return res.status(200).json({
            success: true,
            message: 'Đã áp dụng mã khuyến mãi',
            data: {
                discountPercentage: promo.Discount_Percentage,
                maxDiscountAmount: promo.Max_Discount_Amount
            }
        });
    } catch (error) {
        console.error('applyPromotionCode:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    } finally {
        await session.endSession();
    }
};
