import mongoose from 'mongoose';
import Booking from '../models/BookingModel.js';
import BookingDetail from '../models/BookingDetailModel.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../utils/statusUtils.js';

export const createBooking = async (req, res) => {
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
            Price
        } = req.body;

        const newBooking = await Booking.create({
            Client_Id,
            Total_Amount,
            Service_Date: new Date(Service_Date),
            Service_Address,
            Notes: Notes || "",
            Booking_Status: BOOKING_STATUS.WAITING,
            Payment_Status: PAYMENT_STATUS.UNPAID
        });

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
            .populate('Cleaner_Id', 'Name Phone Avatar')
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

        const bookingDetail = await Booking.findById(bookingId)
            .populate({
                path: 'Client_Id',
                select: '-Password'
            });

        if (!bookingDetail) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng này! Có thể khách đã hủy hoặc xóa đơn."
            });
        }

        const currentStatus = Number(bookingDetail.Booking_Status);
        const isWaiting = currentStatus === 1;

        const isMyJob = bookingDetail.Cleaner_Id && String(bookingDetail.Cleaner_Id) === String(cleanerId);

        if (!isWaiting && !isMyJob) {
            return res.status(403).json({
                success: false,
                message: "Cảnh báo: Bạn không có quyền xem chi tiết đơn hàng của thợ khác!"
            });
        }

        return res.status(200).json({
            success: true,
            data: bookingDetail
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