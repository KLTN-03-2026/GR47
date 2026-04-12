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

export const getBookingDetailsById = async (req, res) => {
    try {
        const bookingId = req.params.id;

        // 1. Kiểm tra xem ID truyền lên có đúng chuẩn MongoDB không (chống app bị crash)
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Mã đơn hàng không hợp lệ!'
            });
        }

        // Lấy ID của khách hàng đang đăng nhập từ middleware 
        const clientId = req.user.id;

        // 2. Tìm đơn hàng chính (Kèm điều kiện Client_Id để khách không xem lén đơn của người khác)
        const booking = await Booking.findOne({
            _id: bookingId,
            Client_Id: clientId
        })
            .populate('Cleaner_Id', 'Name Phone Avatar') // Lấy thêm info người dọn (nếu có)
            .lean(); // Dùng lean() để query nhanh hơn và dễ gộp object ở dưới

        // Nếu không tìm thấy hoặc đơn của người khác -> Báo lỗi ngay
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn này.'
            });
        }

        // 3. Tìm thông tin chi tiết (ĐÃ FIX LỖI TÊN BIẾN Ở ĐÂY NÈ SẾP)
        const bookingDetail = await BookingDetail.findOne({
            Booking_Id: bookingId
        }).lean();

        // 4. Gộp dữ liệu và trả về Frontend
        return res.status(200).json({
            success: true,
            data: {
                // Rải toàn bộ thông tin của booking chính ra
                ...booking,
                // Nhét cái detail vào một object con cho Frontend dễ render
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
        // 1. Dùng Aggregate để "Join" 2 bảng Booking và Booking_Detail
        const bookings = await Booking.aggregate([
            {
                // Chỉ lấy những đơn đang chờ (Status = "1")
                $match: { Booking_Status: "1" }
            },
            {
                // Join với bảng Booking_Detail (tên collection thường là booking_details)
                $lookup: {
                    from: "booking_details", // Tên collection của BookingDetail trong Compass
                    localField: "_id",
                    foreignField: "Booking_Id",
                    as: "AI_Details"
                }
            },
            {
                // Chuyển mảng AI_Details thành object (vì mỗi booking chỉ có 1 detail)
                $unwind: {
                    path: "$AI_Details",
                    preserveNullAndEmptyArrays: true // Đề phòng đơn nào lỗi thiếu detail
                }
            },
            {
                // Join thêm với bảng Client để thợ thấy tên khách
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
                // Sắp xếp đơn mới nhất lên đầu
                $sort: { createdAt: -1 }
            },
            {
                // Chỉ lấy những trường cần thiết cho thợ đỡ nặng máy
                $project: {
                    "Client_Info.Password": 0, // Ẩn mật khẩu khách
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
                    from: "clients",      // Tên collection khách hàng
                    localField: "Client_Id", // KHỚP VỚI SCHEMA SẾP VỪA GỬI
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
                    // Lấy thông tin từ mảng đã Join
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
        const cleanerId = req.user.id; // Lấy ID thợ từ Token middleware

        // 1. Kiểm tra ID đơn hàng hợp lệ
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: "Mã đơn hàng không hợp lệ" });
        }

        /* 2. DÙNG findOneAndUpdate VỚI ĐIỀU KIỆN QUYẾT ĐỊNH:
           - Chỉ update nếu đơn hàng đó vẫn đang ở trạng thái Waiting ("1")
           - VÀ trường Cleaner_Id vẫn đang là null
        */
        const updatedBooking = await Booking.findOneAndUpdate(
            {
                _id: bookingId,
                Booking_Status: "1", // Chỉ nhận đơn đang chờ
                Cleaner_Id: null      // Đảm bảo chưa có ai nhanh tay hơn nhận mất
            },
            {
                $set: {
                    Cleaner_Id: cleanerId,
                    Booking_Status: "2", // Chuyển sang trạng thái "Accepted" (Đã nhận)
                    updatedAt: new Date()
                }
            },
            { new: true } // Trả về đơn hàng sau khi đã update thành công
        );

        // 3. KIỂM TRA KẾT QUẢ
        if (!updatedBooking) {
            /* Nếu không tìm thấy bản ghi thỏa mãn điều kiện trên, 
               nghĩa là đơn đã bị hủy hoặc có thợ khác nhận trước đó chỉ 0.001 giây.
            */
            return res.status(409).json({
                success: false,
                message: "Tiếc quá! Đơn hàng này vừa có người khác nhận mất rồi hoặc không còn khả dụng."
            });
        }

        // 4. Trả về thông báo thành công
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