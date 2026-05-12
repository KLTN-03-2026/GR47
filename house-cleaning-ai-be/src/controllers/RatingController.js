import mongoose from 'mongoose';
import BookingRating from '../models/BookingRatingModel.js';
import Booking from '../models/BookingModel.js';
import Cleaner from '../models/CleanerModel.js';
import { BOOKING_STATUS } from '../utils/statusUtils.js';

const isBookingCompleted = (status) =>
    String(status) === String(BOOKING_STATUS.COMPLETED) || Number(status) === BOOKING_STATUS.COMPLETED;

// ==========================================
// HÀM HELPER: CẬP NHẬT RATING TRUNG BÌNH CỦA CLEANER
// ==========================================
const updateCleanerRating = async (cleanerId) => {
    try {
        // Tính trung bình rating từ tất cả booking ratings của cleaner
        const avgRatingData = await BookingRating.aggregate([
            { $match: { Cleaner_Id: new mongoose.Types.ObjectId(cleanerId) } },
            { $group: { _id: null, avgStars: { $avg: '$Stars' } } }
        ]);

        const averageRating = avgRatingData[0]?.avgStars || 5.0; // Mặc định 5.0 nếu chưa có rating nào

        // Cập nhật Rating field trong Cleaner document
        await Cleaner.findByIdAndUpdate(
            cleanerId,
            { Rating: averageRating },
            { new: true }
        );

        console.log(`✅ Updated cleaner ${cleanerId} rating to ${averageRating}`);
        return averageRating;
    } catch (error) {
        console.error(`❌ Error updating cleaner rating for ${cleanerId}:`, error);
        throw error;
    }
};

// ==========================================
// 1. TẠO RATING MỚI
// ==========================================
export const createRating = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { stars, comment } = req.body;
        const clientId = req.user?.id;

        console.log("🎯 Create Rating Request:", { bookingId, stars, comment, clientId });

        // Validation
        if (!bookingId || !clientId) {
            console.log("❌ Missing bookingId or clientId");
            return res.status(400).json({
                success: false,
                message: "Thiếu bookingId hoặc clientId"
            });
        }

        if (!stars || stars < 1 || stars > 5) {
            console.log("❌ Invalid stars:", stars);
            return res.status(400).json({
                success: false,
                message: "Rating phải từ 1 đến 5 sao"
            });
        }

        if (comment && comment.length > 300) {
            console.log("❌ Comment too long");
            return res.status(400).json({
                success: false,
                message: "Bình luận không quá 300 ký tự"
            });
        }

        // Kiểm tra booking tồn tại & đã hoàn thành
        const booking = await Booking.findById(bookingId).populate('Cleaner_Id');
        console.log("📋 Booking found:", { id: booking?._id, status: booking?.Booking_Status, cleanerId: booking?.Cleaner_Id?._id });
        
        if (!booking) {
            console.log("❌ Booking not found:", bookingId);
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng"
            });
        }

        if (booking.Booking_Status !== '4') { // '4' = Completed
            console.log("❌ Booking not completed. Status:", booking.Booking_Status);
            return res.status(400).json({
                success: false,
                message: `Chỉ có thể đánh giá đơn hàng đã hoàn thành. Trạng thái hiện tại: ${booking.Booking_Status}`
            });
        }

        // Kiểm tra rating đã tồn tại
        const existingRating = await BookingRating.findOne({ Booking_Id: bookingId });
        if (existingRating) {
            console.log("❌ Rating already exists for this booking");
            return res.status(400).json({
                success: false,
                message: "Đơn hàng này đã có đánh giá rồi"
            });
        }

        // Tạo rating mới
        const newRating = new BookingRating({
            Booking_Id: bookingId,
            Client_Id: clientId,
            Cleaner_Id: booking.Cleaner_Id._id,
            Stars: stars,
            Comment: comment || "",
            Created_Date: new Date(),
            Is_Editable: true
        });

        await newRating.save();

        // Cập nhật Booking với Rating_Id
        await Booking.findByIdAndUpdate(bookingId, { Rating_Id: newRating._id });

        // Cập nhật rating trung bình của cleaner
        await updateCleanerRating(booking.Cleaner_Id._id);

        console.log("✅ Rating created successfully:", newRating._id);

        return res.status(201).json({
            success: true,
            message: "Tạo đánh giá thành công",
            data: newRating
        });
    } catch (error) {
        console.error("❌ Error in createRating:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo đánh giá",
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ==========================================
// 2. LẤY RATING CỦA MỘT BOOKING
// ==========================================
export const getRating = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu bookingId"
            });
        }

        const rating = await BookingRating.findOne({ Booking_Id: bookingId })
            .populate('Client_Id', 'Full_Name Avatar')
            .populate('Cleaner_Id', 'Full_Name Avatar');

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: "Chưa có đánh giá cho đơn hàng này"
            });
        }

        return res.status(200).json({
            success: true,
            data: rating
        });
    } catch (error) {
        console.error("Error in getRating:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy đánh giá",
            error: error.message
        });
    }
};

// ==========================================
// 3. CẬP NHẬT RATING
// ==========================================
export const updateRating = async (req, res) => {
    try {
        const { ratingId } = req.params;
        const { stars, comment } = req.body;
        const clientId = req.user?.id;

        if (!ratingId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu ratingId"
            });
        }

        // Validation
        if (!stars || stars < 1 || stars > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating phải từ 1 đến 5 sao"
            });
        }

        if (comment && comment.length > 300) {
            return res.status(400).json({
                success: false,
                message: "Bình luận không quá 300 ký tự"
            });
        }

        // Lấy rating cũ
        const rating = await BookingRating.findById(ratingId);
        if (!rating) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đánh giá"
            });
        }

        // Kiểm tra quyền
        if (rating.Client_Id.toString() !== clientId) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền chỉnh sửa đánh giá này"
            });
        }

        // Kiểm tra xem có thể edit không (< 7 ngày)
        const createdDate = new Date(rating.Created_Date);
        const now = new Date();
        const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

        if (daysDiff >= 7) {
            return res.status(403).json({
                success: false,
                message: "Không thể chỉnh sửa đánh giá sau 7 ngày"
            });
        }

        // Cập nhật
        rating.Stars = stars;
        rating.Comment = comment || "";
        rating.Last_Updated = new Date();
        await rating.save();

        // Cập nhật rating trung bình của cleaner
        await updateCleanerRating(rating.Cleaner_Id);

        return res.status(200).json({
            success: true,
            message: "Cập nhật đánh giá thành công",
            data: rating
        });
    } catch (error) {
        console.error("Error in updateRating:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật đánh giá",
            error: error.message
        });
    }
};

// ==========================================
// 4. XÓA RATING
// ==========================================
export const deleteRating = async (req, res) => {
    try {
        const { ratingId } = req.params;
        const clientId = req.user?.id;

        if (!ratingId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu ratingId"
            });
        }

        const rating = await BookingRating.findById(ratingId);
        if (!rating) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đánh giá"
            });
        }

        // Kiểm tra quyền
        if (rating.Client_Id.toString() !== clientId) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xóa đánh giá này"
            });
        }

        // Kiểm tra xem có thể delete không (< 7 ngày)
        const createdDate = new Date(rating.Created_Date);
        const now = new Date();
        const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

        if (daysDiff >= 7) {
            return res.status(403).json({
                success: false,
                message: "Không thể xóa đánh giá sau 7 ngày"
            });
        }

        // Xóa rating
        await BookingRating.findByIdAndDelete(ratingId);

        // Xóa Rating_Id khỏi Booking
        await Booking.findOneAndUpdate(
            { Rating_Id: ratingId },
            { Rating_Id: null }
        );

        // Cập nhật rating trung bình của cleaner
        await updateCleanerRating(rating.Cleaner_Id);

        return res.status(200).json({
            success: true,
            message: "Xóa đánh giá thành công"
        });
    } catch (error) {
        console.error("Error in deleteRating:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa đánh giá",
            error: error.message
        });
    }
};

// ==========================================
// 5. CLEANER: LẤY ĐÁNH GIÁ THEO BOOKING (chỉ thợ được gán đơn)
// ==========================================
export const getRatingForCleaner = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const cleanerId = req.user?.id;

        if (!bookingId || !cleanerId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu bookingId hoặc phiên đăng nhập'
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        if (!booking.Cleaner_Id || String(booking.Cleaner_Id) !== String(cleanerId)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không được gán cho đơn hàng này'
            });
        }

        if (!isBookingCompleted(booking.Booking_Status)) {
            return res.status(400).json({
                success: false,
                message: 'Chỉ xem đánh giá khi đơn đã hoàn thành'
            });
        }

        const rating = await BookingRating.findOne({ Booking_Id: bookingId })
            .populate('Client_Id', 'Full_Name Avatar')
            .populate('Cleaner_Id', 'Full_Name Avatar');

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Chưa có đánh giá cho đơn hàng này'
            });
        }

        return res.status(200).json({
            success: true,
            data: rating
        });
    } catch (error) {
        console.error('Error in getRatingForCleaner:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy đánh giá',
            error: error.message
        });
    }
};

// ==========================================
// 7. CLEANER: TRẢ LỜI / CẬP NHẬT PHẢN HỒI ĐÁNH GIÁ
// ==========================================
export const replyToBookingRating = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reply } = req.body;
        const cleanerId = req.user?.id;

        if (!bookingId || !cleanerId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu bookingId hoặc phiên đăng nhập'
            });
        }

        const text = typeof reply === 'string' ? reply.trim() : '';
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung phản hồi không được để trống'
            });
        }
        if (text.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Phản hồi không quá 500 ký tự'
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        if (!booking.Cleaner_Id || String(booking.Cleaner_Id) !== String(cleanerId)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không được gán cho đơn hàng này'
            });
        }

        if (!isBookingCompleted(booking.Booking_Status)) {
            return res.status(400).json({
                success: false,
                message: 'Chỉ phản hồi khi đơn đã hoàn thành'
            });
        }

        const rating = await BookingRating.findOne({ Booking_Id: bookingId });
        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Chưa có đánh giá để phản hồi'
            });
        }

        rating.Cleaner_Reply = text;
        rating.Cleaner_Reply_Date = new Date();
        rating.Last_Updated = new Date();
        await rating.save();

        const populated = await BookingRating.findById(rating._id)
            .populate('Client_Id', 'Full_Name Avatar')
            .populate('Cleaner_Id', 'Full_Name Avatar');

        return res.status(200).json({
            success: true,
            message: 'Đã gửi phản hồi',
            data: populated
        });
    } catch (error) {
        console.error('Error in replyToBookingRating:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi gửi phản hồi',
            error: error.message
        });
    }
};

// ==========================================
// 8. LẤY DANH SÁCH RATING CỦA MỘT CLEANER
// ==========================================
export const getCleanerRatings = async (req, res) => {
    try {
        const { cleanerId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!cleanerId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu cleanerId"
            });
        }

        const skip = (page - 1) * limit;

        const ratings = await BookingRating.find({ Cleaner_Id: cleanerId })
            .populate('Client_Id', 'Full_Name Avatar')
            .populate('Booking_Id', '_id Service_Date')
            .sort({ Created_Date: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await BookingRating.countDocuments({ Cleaner_Id: cleanerId });

        // Tính average rating
        const avgRating = await BookingRating.aggregate([
            { $match: { Cleaner_Id: new mongoose.Types.ObjectId(cleanerId) } },
            { $group: { _id: null, avgStars: { $avg: '$Stars' } } }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                ratings,
                averageRating: avgRating[0]?.avgStars || 0,
                totalRatings: total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error in getCleanerRatings:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách đánh giá",
            error: error.message
        });
    }
};
