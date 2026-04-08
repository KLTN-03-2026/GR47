// src/controllers/ClientController.js
import Client from '../models/ClientModel.js';
import jwt from 'jsonwebtoken';
import { CLIENTSTATUS } from '../utils/statusUtils.js';


export const login = async (req, res) => {
    try {
        const { Phone_Number, Password } = req.body;

        // 1. Kiểm tra input cơ bản
        if (!Phone_Number || !Password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp số điện thoại và mật khẩu.'
            });
        }

        // 2. Tìm User trong Database
        // CHÚ Ý: Phải gọi .select('+Password') vì trong Model bạn đã để select: false
        const client = await Client.findOne({ Phone_Number }).select('+Password');

        if (!client) {
            return res.status(401).json({
                success: false,
                message: 'Số điện thoại hoặc mật khẩu không chính xác.'
            });
        }

        // 3. Kiểm tra mật khẩu bằng instance method đã viết ở Schema
        const isMatch = await client.comparePassword(Password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Số điện thoại hoặc mật khẩu không chính xác.'
            });
        }

        // 4. Kiểm tra trạng thái tài khoản (Tuỳ chọn nhưng khuyên dùng)
        if (client.Status !== CLIENTSTATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn chưa được kích hoạt hoặc đã bị khóa.'
            });
        }

        // 5. Tạo JWT Token
        // Cần có biến JWT_SECRET trong file .env
        const token = jwt.sign(
            {
                id: client._id,
                phone: client.Phone_Number,
                role: 'client'
            },
            process.env.JWT_SECRET || 'fallback_secret_key_please_change',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } // Token sống 7 ngày
        );

        // 6. Trả về Response
        // Mặc định Express khi dùng res.json() sẽ gọi hàm toJSON() của Mongoose Document.
        // Hàm toJSON bạn định nghĩa trong Model đã tự động xóa trường Password!
        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            data: client
        });

    } catch (error) {
        console.error('Lỗi Login Controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi máy chủ.',
            error: error.message
        });
    }
};

export const register = async (req, res) => {
    try {
        const { Full_Name, Phone_Number, Password, Confirm_Password } = req.body;

        if (!Full_Name || !Phone_Number || !Password || !Confirm_Password) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
        }

        if (Password !== Confirm_Password) {
            return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp.' });
        }

        const existingClient = await Client.findOne({ Phone_Number });
        if (existingClient) {
            return res.status(409).json({ success: false, message: 'Số điện thoại này đã được đăng ký.' });
        }

        const newClient = await Client.create({
            Full_Name,
            Phone_Number,
            Password
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo tài khoản thành công',
            data: newClient
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};

export const getAllClientsFull = async (req, res) => {
    try {
        // 1. Nhận các tham số từ query URL (có gán giá trị mặc định)
        const {
            page = 1,
            limit = 10,
            search = '',
            status,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        // 2. Xây dựng bộ lọc (Query Object)
        const query = {};

        // 2.1 Tìm kiếm linh hoạt theo Tên hoặc Số điện thoại (Không phân biệt hoa thường)
        if (search) {
            query.$or = [
                { Full_Name: { $regex: search, $options: 'i' } },
                { Phone_Number: { $regex: search, $options: 'i' } }
            ];
        }

        // 2.2 Lọc theo trạng thái (nếu client có truyền lên)
        if (status !== undefined && status !== '') {
            query.Status = Number(status);
        }

        // 3. Thiết lập Phân trang
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // 4. Thiết lập Sắp xếp (Mặc định: mới nhất lên đầu)
        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        // 5. Query Database (Dùng Promise.all để chạy song song 2 lệnh giúp tăng tốc API)
        const [clients, totalItems] = await Promise.all([
            // Lệnh 1: Lấy data theo bộ lọc, phân trang và sắp xếp
            Client.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNumber),
            // Lệnh 2: Đếm tổng số lượng bản ghi thỏa mãn điều kiện để frontend làm nút Next/Prev
            Client.countDocuments(query)
        ]);

        // 6. Trả về Response
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách khách hàng thành công',
            data: clients,
            pagination: {
                currentPage: pageNumber,
                itemsPerPage: limitNumber,
                totalItems,
                totalPages: Math.ceil(totalItems / limitNumber)
            }
        });

    } catch (error) {
        console.error('Lỗi getAllClientsFull Controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi máy chủ khi lấy danh sách khách hàng.',
            error: error.message
        });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const client = await Client.findById(req.user.id);

        if (!client) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
        }

        if (client.Status !== CLIENTSTATUS.ACTIVE) {
            return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Xác thực thành công',
            data: client
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message
        });
    }
};