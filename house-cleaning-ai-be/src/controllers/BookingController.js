import mongoose from 'mongoose';
import Booking from '../models/BookingModel.js';
import BookingDetail from '../models/BookingDetailModel.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../utils/statusUtils.js';
import Client from '../models/ClientModel.js';
import Cleaner from '../models/CleanerModel.js';
import { creditCleanerForCompletedBooking } from '../services/walletSettlement.js';
import CleanerPenalty from '../models/CleanerPenaltyModel.js';
import WalletTransaction from '../models/WalletTransactionModel.js';
import { createNotification } from '../services/notificationService.js';

const isIPayMethod = (paymentStatus) =>
    Number(paymentStatus) === Number(PAYMENT_STATUS.PAID); // FE đang dùng "2" = iPay

const refundableStatusForClient = (bookingStatus) => {
    const s = Number(bookingStatus);
    return s === Number(BOOKING_STATUS.WAITING) || s === Number(BOOKING_STATUS.ACCEPTED);
};

const refundableStatusForCleaner = (bookingStatus) => {
    const s = Number(bookingStatus);
    return s === Number(BOOKING_STATUS.ACCEPTED); // cleaner chỉ hủy khi đang di chuyển
};

// ==========================================
// HÀM HELPER: CẬP NHẬT SỐ ĐƠNHÀNG ĐÃ HOÀN THÀNH CỦA CLEANER
// ==========================================
const updateCleanerCompletedCount = async (cleanerId) => {
    try {
        // Đếm tổng số booking đã hoàn thành (Booking_Status = "4")
        const completedCount = await Booking.countDocuments({
            Cleaner_Id: cleanerId,
            Booking_Status: String(BOOKING_STATUS.COMPLETED)
        });

        // Cập nhật Completed_Bookings_Count trong Cleaner document
        await Cleaner.findByIdAndUpdate(
            cleanerId,
            { Completed_Bookings_Count: completedCount },
            { new: true }
        );

        console.log(`✅ Updated cleaner ${cleanerId} completed bookings count to ${completedCount}`);
        return completedCount;
    } catch (error) {
        console.error(`❌ Error updating completed bookings count for ${cleanerId}:`, error);
        throw error;
    }
};

async function refundClientForBooking({ booking, session }) {
    if (!booking) return { refunded: false };
    if (!isIPayMethod(booking.Payment_Status)) return { refunded: false };
    if (booking.Refund_Settled === true) return { refunded: false };

    const amount = Math.max(0, Math.floor(Number(booking.Total_Amount) || 0));
    if (!amount) {
        booking.Refund_Settled = true;
        await booking.save({ session });
        return { refunded: false };
    }

    const client = await Client.findById(booking.Client_Id).session(session);
    if (!client) {
        // Nếu mất client thì vẫn không đánh dấu refund, để admin xử lý sau
        return { refunded: false };
    }

    client.IPay_Balance = (Number(client.IPay_Balance) || 0) + amount;
    await client.save({ session });

    await WalletTransaction.create([{
        User_Type: 'client',
        User_Id: booking.Client_Id,
        Category: 'REFUND',
        Amount: amount,
        Description: `Hoàn tiền đơn #${String(booking._id).slice(-6).toUpperCase()} (iPay)`,
        Related_Booking_Id: booking._id
    }], { session });

    await createNotification({
        userType: 'client',
        userId: booking.Client_Id,
        title: 'Đã hoàn tiền',
        message: `Bạn đã được hoàn ${amount.toLocaleString('vi-VN')}đ cho đơn #${String(booking._id).slice(-6).toUpperCase()}.`,
        type: 'WALLET',
        relatedBookingId: booking._id,
        session
    });

    booking.Refund_Settled = true;
    await booking.save({ session });

    return { refunded: true, amount };
}

export const createBooking = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        console.log(">>> Middleware trả về user:", req.user);

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
            Price,
            Payment_Method,
            Payment_Status: PaymentStatusFromClient
        } = req.body;

        const totalAmountNumber = Math.max(0, Math.floor(Number(Total_Amount) || 0));
        if (!totalAmountNumber) {
            return res.status(400).json({ success: false, message: 'Tổng tiền không hợp lệ' });
        }

        // FE hiện gửi Payment_Method: 1=cash, 2=iPay. Một số nơi dùng Payment_Status.
        const paymentMethodOrStatus = Payment_Method ?? PaymentStatusFromClient ?? PAYMENT_STATUS.UNPAID;
        const payStatus = String(paymentMethodOrStatus);
        const isIPay = Number(payStatus) === Number(PAYMENT_STATUS.PAID); // "2" = iPay

        let newBookingId;

        await session.withTransaction(async () => {
            // Nếu thanh toán iPay thì trừ ví trước (atomic)
            if (isIPay) {
                const client = await Client.findById(Client_Id).session(session);
                if (!client) {
                    const err = new Error('CLIENT_NOT_FOUND');
                    err.code = 'CLIENT_NOT_FOUND';
                    throw err;
                }

                const bal = Number(client.IPay_Balance || 0);
                if (bal < totalAmountNumber) {
                    const err = new Error('INSUFFICIENT_WALLET');
                    err.code = 'INSUFFICIENT_WALLET';
                    throw err;
                }

                client.IPay_Balance = bal - totalAmountNumber;
                await client.save({ session });
            }

            const newBooking = await Booking.create([{
                Client_Id,
                Total_Amount: totalAmountNumber,
                Service_Date: new Date(Service_Date),
                Service_Address,
                Notes: Notes || "",
                Booking_Status: BOOKING_STATUS.WAITING,
                // Payment_Status đang được FE dùng như "phương thức thanh toán": 1=cash, 2=iPay
                Payment_Status: isIPay ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.UNPAID
            }], { session });

            const bookingDoc = newBooking?.[0];
            newBookingId = bookingDoc._id;

            await BookingDetail.create([{
                Booking_Id: bookingDoc._id,
                Image_Url,
                Area_m2,
                Mess_Level,
                Price
            }], { session });

            await createNotification({
                userType: 'client',
                userId: Client_Id,
                title: 'Đặt đơn thành công',
                message: `Đơn #${String(bookingDoc._id).slice(-6).toUpperCase()} đã được tạo. Hệ thống đang tìm cleaner phù hợp.`,
                type: 'BOOKING',
                relatedBookingId: bookingDoc._id,
                session
            });

            if (isIPay) {
                await WalletTransaction.create([{
                    User_Type: 'client',
                    User_Id: Client_Id,
                    Category: 'SPEND',
                    Amount: totalAmountNumber,
                    Description: `Thanh toán đơn #${String(bookingDoc._id).slice(-6).toUpperCase()} bằng iPay`,
                    Related_Booking_Id: bookingDoc._id
                }], { session });
            }
        });

        return res.status(201).json({
            success: true,
            message: '🚀 Chốt đơn thành công! Đang đợi thợ nhận việc.',
            bookingId: newBookingId
        });
    } catch (error) {
        if (error?.code === 'INSUFFICIENT_WALLET') {
            return res.status(400).json({ success: false, message: 'Số dư ví không đủ để thanh toán' });
        }
        if (error?.code === 'CLIENT_NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản khách hàng' });
        }
        console.error("❌ Lỗi lưu DB:", error);
        return res.status(500).json({
            success: false,
            message: 'Lưu đơn hàng thất bại. Check lại logic DB.',
            error: error.message
        });
    } finally {
        await session.endSession();
    }
};

export const cancelBookingByClient = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const bookingId = req.params.id;
        const clientId = req.user?.id;
        const reason = String(req.body?.Cancel_Reason || '').trim();

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: 'Mã đơn hàng không hợp lệ' });
        }

        let refunded = false;
        let refundAmount = 0;

        await session.withTransaction(async () => {
            const booking = await Booking.findOne({ _id: bookingId, Client_Id: clientId }).session(session);
            if (!booking) {
                const err = new Error('NOT_FOUND');
                err.code = 'NOT_FOUND';
                throw err;
            }

            if (!refundableStatusForClient(booking.Booking_Status)) {
                const err = new Error('NOT_CANCELLABLE');
                err.code = 'NOT_CANCELLABLE';
                throw err;
            }

            booking.Booking_Status = BOOKING_STATUS.CANCELLED;
            if (reason) booking.Cancel_Reason = reason.slice(0, 500);
            await booking.save({ session });

            await createNotification({
                userType: 'client',
                userId: booking.Client_Id,
                title: 'Đơn đã bị hủy',
                message: `Đơn #${String(booking._id).slice(-6).toUpperCase()} đã được hủy theo yêu cầu của bạn.`,
                type: 'BOOKING',
                relatedBookingId: booking._id,
                session
            });

            if (booking.Cleaner_Id) {
                await createNotification({
                    userType: 'cleaner',
                    userId: booking.Cleaner_Id,
                    title: 'Đơn đã bị hủy',
                    message: `Khách hàng đã hủy đơn #${String(booking._id).slice(-6).toUpperCase()}.`,
                    type: 'BOOKING',
                    relatedBookingId: booking._id,
                    session
                });
            }

            const ref = await refundClientForBooking({ booking, session });
            refunded = ref.refunded;
            refundAmount = ref.amount || 0;

            // Cập nhật lại số đơn hoàn thành của cleaner nếu booking có cleaner gán
            if (booking.Cleaner_Id) {
                await updateCleanerCompletedCount(booking.Cleaner_Id);
            }
        });

        return res.status(200).json({
            success: true,
            message: refunded
                ? `Hủy đơn thành công. Đã hoàn ${refundAmount.toLocaleString('vi-VN')}đ về ví iPay.`
                : 'Hủy đơn thành công.',
        });
    } catch (error) {
        if (error?.code === 'NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }
        if (error?.code === 'NOT_CANCELLABLE') {
            return res.status(400).json({ success: false, message: 'Không thể hủy đơn ở trạng thái hiện tại' });
        }
        console.error('cancelBookingByClient:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi hủy đơn', error: error.message });
    } finally {
        await session.endSession();
    }
};

export const cancelBookingByCleaner = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const bookingId = req.params.id;
        const cleanerId = req.user?.id;
        const reason = String(req.body?.Cancel_Reason || '').trim();

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: 'Mã đơn hàng không hợp lệ' });
        }

        let refunded = false;
        let refundAmount = 0;

        await session.withTransaction(async () => {
            const booking = await Booking.findOne({ _id: bookingId, Cleaner_Id: cleanerId }).session(session);
            if (!booking) {
                const err = new Error('NOT_FOUND');
                err.code = 'NOT_FOUND';
                throw err;
            }

            if (!refundableStatusForCleaner(booking.Booking_Status)) {
                const err = new Error('NOT_CANCELLABLE');
                err.code = 'NOT_CANCELLABLE';
                throw err;
            }

            booking.Booking_Status = BOOKING_STATUS.CANCELLED;
            if (reason) booking.Cancel_Reason = reason.slice(0, 500);
            await booking.save({ session });

            await createNotification({
                userType: 'client',
                userId: booking.Client_Id,
                title: 'Đơn đã bị hủy',
                message: `Cleaner đã hủy đơn #${String(booking._id).slice(-6).toUpperCase()}.`,
                type: 'BOOKING',
                relatedBookingId: booking._id,
                session
            });

            await createNotification({
                userType: 'cleaner',
                userId: booking.Cleaner_Id,
                title: 'Bạn đã hủy đơn',
                message: `Bạn đã hủy đơn #${String(booking._id).slice(-6).toUpperCase()}.`,
                type: 'BOOKING',
                relatedBookingId: booking._id,
                session
            });

            const ref = await refundClientForBooking({ booking, session });
            refunded = ref.refunded;
            refundAmount = ref.amount || 0;

            // Cập nhật lại số đơn hoàn thành của cleaner
            await updateCleanerCompletedCount(booking.Cleaner_Id);
        });

        return res.status(200).json({
            success: true,
            message: refunded
                ? `Hủy đơn thành công. Đã hoàn ${refundAmount.toLocaleString('vi-VN')}đ về ví iPay cho khách.`
                : 'Hủy đơn thành công.',
        });
    } catch (error) {
        if (error?.code === 'NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }
        if (error?.code === 'NOT_CANCELLABLE') {
            return res.status(400).json({ success: false, message: 'Không thể hủy đơn ở trạng thái hiện tại' });
        }
        console.error('cancelBookingByCleaner:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi hủy đơn', error: error.message });
    } finally {
        await session.endSession();
    }
};

export const getClientBookings = async (req, res) => {
    try {
        const Client_Id = req.user._id;

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

export const getBookingDetailsById = async (req, res) => {
    try {
        const bookingId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Mã đơn hàng không hợp lệ!'
            });
        }

        const clientId = req.user.id;

        const booking = await Booking.findOne({
            _id: bookingId,
            Client_Id: clientId
        })
            .populate('Cleaner_Id', 'Name Phone Avatar Full_Name Phone_Number Rating Address createdAt')
            .lean();

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn này.'
            });
        }

        const bookingDetail = await BookingDetail.findOne({
            Booking_Id: bookingId
        }).lean();

        return res.status(200).json({
            success: true,
            data: {
                ...booking,
                AI_Details: bookingDetail || null
            }
        });

    } catch (error) {
        console.error("❌ Lỗi khi lấy chi tiết đơn hàng:", error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
};

export const getWaitingBookingsForCleaner = async (req, res) => {
    try {
        const bookings = await Booking.aggregate([
            {
                $match: { Booking_Status: "1" }
            },
            {
                $lookup: {
                    from: "booking_details",
                    localField: "_id",
                    foreignField: "Booking_Id",
                    as: "AI_Details"
                }
            },
            {
                $unwind: {
                    path: "$AI_Details",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "clients",
                    localField: "Client_Id",
                    foreignField: "_id",
                    as: "Client_Info"
                }
            },
            {
                $unwind: "$Client_Info"
            },
            {
                $addFields: {
                    Estimated_Income: {
                        $floor: {
                            $multiply: [
                                { $ifNull: ["$AI_Details.Price", "$Total_Amount"] },
                                0.9
                            ]
                        }
                    }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    "Client_Info.Password": 0,
                    "Client_Info.Tokens": 0
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        console.error("❌ Lỗi lấy đơn chờ:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

export const getBookingDetailWaitingForCleaner = async (req, res) => {
    try {
        const bookingId = req.params.id;

        const booking = await Booking.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(bookingId) }
            },
            {
                $lookup: {
                    from: "clients",
                    localField: "Client_Id",
                    foreignField: "_id",
                    as: "Client_Data"
                }
            },
            { $unwind: { path: "$Client_Data", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "booking_details",
                    localField: "_id",
                    foreignField: "Booking_Id",
                    as: "AI_Details"
                }
            },
            { $unwind: { path: "$AI_Details", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    Total_Amount: 1,
                    Booking_Status: 1,
                    Payment_Status: 1,
                    Service_Date: 1,
                    Service_Address: 1,
                    Notes: 1,
                    createdAt: 1,
                    Estimated_Income: {
                        $floor: {
                            $multiply: [
                                { $ifNull: ["$AI_Details.Price", "$Total_Amount"] },
                                0.9
                            ]
                        }
                    },
                    AI_Details: 1,
                    Client_Name: { $ifNull: ["$Client_Data.Name", "$Client_Data.Full_Name", "N/A"] },
                    Client_Phone: { $ifNull: ["$Client_Data.Phone_Number", "Không có SĐT"] },
                    Client_Avatar: { $ifNull: ["$Client_Data.Avatar", ""] }
                }
            }
        ]);

        if (!booking || booking.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
        }

        return res.status(200).json({ success: true, data: booking[0] });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const acceptBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const cleanerId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: "Mã đơn hàng không hợp lệ" });
        }

        // Kiểm tra xem Cleaner có đang bị khóa nhận đơn (do bị xử phạt) hay không
        const now = new Date();
        const activePenalty = await CleanerPenalty.findOne({
            Cleaner_Id: cleanerId,
            Is_Active: true,
            $or: [
                { Penalty_End_Date: { $gt: now } },
                { Penalty_Type: 'ACCOUNT_LOCK' }
            ]
        });

        if (activePenalty) {
            let penaltyMessage = "Tài khoản của bạn đang bị hạn chế nhận đơn do vi phạm quy định.";
            if (activePenalty.Penalty_Type === 'ACCOUNT_LOCK') {
                penaltyMessage = "Tài khoản của bạn đã bị khóa vĩnh viễn. Vui lòng liên hệ quản trị viên.";
            } else if (activePenalty.Penalty_End_Date) {
                const minutesLeft = Math.ceil((activePenalty.Penalty_End_Date - now) / 60000);
                penaltyMessage = `Bạn đang bị khóa nhận đơn. Vui lòng thử lại sau ${minutesLeft} phút.`;
            }
            return res.status(403).json({ success: false, message: penaltyMessage });
        }

        const updatedBooking = await Booking.findOneAndUpdate(
            {
                _id: bookingId,
                Booking_Status: "1",
                Cleaner_Id: null
            },
            {
                $set: {
                    Cleaner_Id: cleanerId,
                    Booking_Status: "2",
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(409).json({
                success: false,
                message: "Tiếc quá! Đơn hàng này vừa có người khác nhận mất rồi hoặc không còn khả dụng."
            });
        }

        await Promise.all([
            createNotification({
                userType: 'client',
                userId: updatedBooking.Client_Id,
                title: 'Đã có cleaner nhận đơn',
                message: `Đơn #${String(updatedBooking._id).slice(-6).toUpperCase()} đã có người dọn nhận việc.`,
                type: 'BOOKING',
                relatedBookingId: updatedBooking._id
            }),
            createNotification({
                userType: 'cleaner',
                userId: cleanerId,
                title: 'Nhận đơn thành công',
                message: `Bạn đã nhận đơn #${String(updatedBooking._id).slice(-6).toUpperCase()}. Hãy chuẩn bị đến địa điểm làm việc.`,
                type: 'BOOKING',
                relatedBookingId: updatedBooking._id
            })
        ]);

        return res.status(200).json({
            success: true,
            message: "Xác nhận nhận đơn thành công! Hãy chuẩn bị đồ nghề nhé.",
            data: updatedBooking
        });

    } catch (error) {
        console.error("❌ Lỗi nhận đơn:", error);
        return res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const clientId = req.user.id;

        const bookings = await Booking.aggregate([
            {
                $match: { Client_Id: new mongoose.Types.ObjectId(clientId) }
            },
            {
                $lookup: {
                    from: "booking_details",
                    localField: "_id",
                    foreignField: "Booking_Id",
                    as: "AI_Details"
                }
            },
            { $unwind: { path: "$AI_Details", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "cleaners",
                    localField: "Cleaner_Id",
                    foreignField: "_id",
                    as: "Cleaner_Info"
                }
            },
            { $unwind: { path: "$Cleaner_Info", preserveNullAndEmptyArrays: true } },
            {
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    _id: 1,
                    Total_Amount: 1,
                    Booking_Status: 1,
                    Payment_Status: 1,
                    Service_Date: 1,
                    Service_Address: 1,
                    Notes: 1,
                    createdAt: 1,
                    AI_Details: 1,
                    Cleaner_Name: { $ifNull: ["$Cleaner_Info.Name", "$Cleaner_Info.Full_Name", null] },
                    Cleaner_Phone: { $ifNull: ["$Cleaner_Info.Phone", "$Cleaner_Info.PhoneNumber", null] },
                    Cleaner_Avatar: { $ifNull: ["$Cleaner_Info.Avatar", null] }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        console.error("❌ Lỗi lấy danh sách đơn của khách:", error);
        return res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
};

export const getInProgressBookingsForCleaner = async (req, res) => {
    try {
        const cleanerId = req.user.id;

        const inProgressBookings = await Booking.aggregate([
            {
                $match: {
                    Cleaner_Id: new mongoose.Types.ObjectId(cleanerId),
                    Booking_Status: { $in: ["2", "3", "4"] }
                }
            },
            {
                $lookup: {
                    from: "clients",
                    localField: "Client_Id",
                    foreignField: "_id",
                    as: "Client_Data"
                }
            },
            { $unwind: { path: "$Client_Data", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "booking_details",
                    localField: "_id",
                    foreignField: "Booking_Id",
                    as: "AI_Details"
                }
            },
            { $unwind: { path: "$AI_Details", preserveNullAndEmptyArrays: true } },
            {
                $sort: { updatedAt: -1 }
            },
            {
                $project: {
                    _id: 1,
                    Total_Amount: 1,
                    Booking_Status: 1,
                    Payment_Status: 1,
                    Service_Date: 1,
                    Service_Address: 1,
                    Notes: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    Estimated_Income: {
                        $floor: {
                            $multiply: [
                                { $ifNull: ["$AI_Details.Price", "$Total_Amount"] },
                                0.9
                            ]
                        }
                    },
                    AI_Details: 1,
                    Client_Name: { $ifNull: ["$Client_Data.Name", "$Client_Data.Full_Name", "Khách hàng"] },
                    Client_Phone: { $ifNull: ["$Client_Data.Phone", "$Client_Data.Phone_Number", ""] },
                    Client_Avatar: { $ifNull: ["$Client_Data.Avatar", ""] }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: inProgressBookings.length,
            data: inProgressBookings
        });

    } catch (error) {
        console.error("❌ Lỗi lấy danh sách đơn của thợ:", error);
        return res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
};

export const checkInAndCheckOut = async (req, res) => {
    try {
        const bookingId = req.params.id; // Lấy ID đơn hàng từ URL
        const cleanerId = req.user.id;   // Lấy ID của thợ từ token

        // 1. Tìm đơn hàng (Bắt buộc phải là đơn do chính ông thợ này nhận)
        const booking = await Booking.findOne({
            _id: bookingId,
            Cleaner_Id: cleanerId
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng, hoặc đơn này không thuộc về bạn!"
            });
        }

        let newStatus;
        let responseMessage = "";

        const currentStatus = Number(booking.Booking_Status);

        if (currentStatus === 2) {
            newStatus = 3;
            responseMessage = "Check-in thành công! Chúc bạn làm việc hiệu quả nhé.";

        } else if (currentStatus === 3) {
            newStatus = 4;
            responseMessage = "Check-out thành công! Căn phòng đã sạch bong sáng bóng.";

        } else {
            let statusText = "Không xác định";
            if (currentStatus === 1) statusText = "Đang chờ nhận";
            if (currentStatus === 4) statusText = "Đã hoàn thành";
            if (currentStatus === 5) statusText = "Đã hủy";

            return res.status(400).json({
                success: false,
                message: `Thao tác không hợp lệ! Đơn hàng hiện đang ở trạng thái: ${statusText}`
            });
        }

        booking.Booking_Status = newStatus;
        await booking.save();

        if (Number(newStatus) === Number(BOOKING_STATUS.IN_PROGRESS)) {
            await Promise.all([
                createNotification({
                    userType: 'client',
                    userId: booking.Client_Id,
                    title: 'Cleaner bắt đầu làm việc',
                    message: `Cleaner đã bắt đầu dọn dẹp đơn #${String(booking._id).slice(-6).toUpperCase()}.`,
                    type: 'BOOKING',
                    relatedBookingId: booking._id
                }),
                createNotification({
                    userType: 'cleaner',
                    userId: cleanerId,
                    title: 'Bạn đã bắt đầu công việc',
                    message: `Bạn đã check-in đơn #${String(booking._id).slice(-6).toUpperCase()}.`,
                    type: 'BOOKING',
                    relatedBookingId: booking._id
                })
            ]);
        }

        if (Number(newStatus) === Number(BOOKING_STATUS.COMPLETED)) {
            await Promise.all([
                createNotification({
                    userType: 'client',
                    userId: booking.Client_Id,
                    title: 'Cleaner đã hoàn thành công việc',
                    message: `Đơn #${String(booking._id).slice(-6).toUpperCase()} đã hoàn thành. Bạn có thể đánh giá trải nghiệm.`,
                    type: 'BOOKING',
                    relatedBookingId: booking._id
                }),
                createNotification({
                    userType: 'cleaner',
                    userId: cleanerId,
                    title: 'Hoàn thành công việc',
                    message: `Bạn đã check-out đơn #${String(booking._id).slice(-6).toUpperCase()}. Thu nhập sẽ được ghi nhận vào ví.`,
                    type: 'BOOKING',
                    relatedBookingId: booking._id
                })
            ]);
        }

        if (Number(newStatus) === Number(BOOKING_STATUS.COMPLETED)) {
            try {
                await creditCleanerForCompletedBooking(booking._id);
                // Cập nhật số đơn hàng đã hoàn thành của cleaner
                await updateCleanerCompletedCount(booking.Cleaner_Id);
            } catch (settleErr) {
                console.error('❌ Ghi nhận thu nhập cleaner:', settleErr);
            }
        }

        return res.status(200).json({
            success: true,
            message: responseMessage,
            data: {
                _id: booking._id,
                Booking_Status: booking.Booking_Status
            }
        });

    } catch (error) {
        console.error("❌ Lỗi Check-in / Check-out:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi Server: " + error.message
        });
    }
};

export const getBookingDetailForCleaner = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const cleanerId = req.user.id;

        const booking = await Booking.findById(bookingId)
            .populate({
                path: 'Client_Id',
                select: '-Password'
            }).lean();

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng này! Có thể khách đã hủy hoặc xóa đơn."
            });
        }

        const currentStatus = Number(booking.Booking_Status);
        const isWaiting = currentStatus === 1;

        const isMyJob = booking.Cleaner_Id && String(booking.Cleaner_Id) === String(cleanerId);

        if (!isWaiting && !isMyJob) {
            return res.status(403).json({
                success: false,
                message: "Cảnh báo: Bạn không có quyền xem chi tiết đơn hàng của thợ khác!"
            });
        }

        const bookingDetail = await BookingDetail.findOne({ Booking_Id: bookingId }).lean();
        const basePrice = bookingDetail ? bookingDetail.Price : booking.Total_Amount;
        const estimatedIncome = Math.floor(basePrice * 0.9);

        return res.status(200).json({
            success: true,
            data: {
                ...booking,
                AI_Details: bookingDetail,
                Estimated_Income: estimatedIncome
            }
        });

    } catch (error) {
        console.error("❌ Lỗi lấy chi tiết đơn (Cleaner):", error);

        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Định dạng mã đơn hàng không hợp lệ!"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Lỗi Server: " + error.message
        });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status, sortBy = 'createdAt', order = 'desc' } = req.query;

        const query = {};

        if (status) {
            query.Booking_Status = status;
        }

        if (search) {
            const clients = await Client.find({ Full_Name: { $regex: search, $options: 'i' } }).select('_id');
            const clientIds = clients.map(c => c._id);

            query.$or = [
                { Notes: { $regex: search, $options: 'i' } },
                { Client_Id: { $in: clientIds } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: order === 'desc' ? -1 : 1 };

        const [bookings, totalItems] = await Promise.all([
            Booking.find(query)
                .populate('Client_Id', 'Full_Name Phone_Number')
                .populate('Cleaner_Id', 'Full_Name Phone_Number')
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit)),
            Booking.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            message: 'Lấy toàn bộ danh sách chuyến đi thành công!',
            data: bookings,
            pagination: {
                currentPage: parseInt(page),
                totalItems,
                totalPages: Math.ceil(totalItems / parseInt(limit))
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Máy chủ gặp sự cố khi trích xuất danh sách chuyến đi',
            chi_tiet_loi: error.message
        });
    }
};
