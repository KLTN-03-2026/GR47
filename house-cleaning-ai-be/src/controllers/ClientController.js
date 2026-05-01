// src/controllers/ClientController.js
import Client from '../models/ClientModel.js';
import jwt from 'jsonwebtoken';
import { CLIENTSTATUS } from '../utils/statusUtils.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const login = async (req, res) => {
    try {
        const { Phone_Number, Password } = req.body;

        if (!Phone_Number || !Password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp số điện thoại và mật khẩu.'
            });
        }

        const client = await Client.findOne({ Phone_Number }).select('+Password');

        if (!client) {
            return res.status(401).json({
                success: false,
                message: 'Số điện thoại hoặc mật khẩu không chính xác.'
            });
        }

        const isMatch = await client.comparePassword(Password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Số điện thoại hoặc mật khẩu không chính xác.'
            });
        }

        if (client.Status !== CLIENTSTATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn chưa được kích hoạt hoặc đã bị khóa.'
            });
        }

        const token = jwt.sign(
            {
                id: client._id,
                phone: client.Phone_Number,
                role: 'client'
            },
            process.env.JWT_SECRET || 'fallback_secret_key_please_change',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

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
        const {
            page = 1,
            limit = 10,
            search = '',
            status,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { Full_Name: { $regex: search, $options: 'i' } },
                { Phone_Number: { $regex: search, $options: 'i' } }
            ];
        }

        if (status !== undefined && status !== '') {
            query.Status = Number(status);
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        const [clients, totalItems] = await Promise.all([
            Client.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNumber),
            Client.countDocuments(query)
        ]);

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

export const updateAvatar = async (req, res) => {
    try {
        const urlId = req.params.id;

        const tokenId = req.user.id;
        if (urlId !== String(tokenId)) {
            return res.status(403).json({
                success: false,
                message: 'Cảnh báo bảo mật: Bạn không được phép đổi ảnh của người khác!'
            });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn một ảnh để tải lên!'
            });
        }

        const client = await Client.findById(urlId);
        if (!client) {
            return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
        }

        console.log("☁️ Đang tải Avatar lên Cloudinary...");
        const uploadStreamToCloudinary = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "cleanai_avatars" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(buffer);
            });
        };

        const cloudinaryResult = await uploadStreamToCloudinary(file.buffer);
        const secureImageUrl = cloudinaryResult.secure_url;

        client.Avatar = secureImageUrl;
        await client.save();

        return res.status(200).json({
            success: true,
            message: 'Cập nhật ảnh đại diện thành công!',
            data: {
                _id: client._id,
                Full_Name: client.Full_Name,
                Email: client.Email,
                Avatar: client.Avatar
            }
        });

    } catch (error) {
        console.error("❌ Lỗi Update Avatar Controller:", error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi cập nhật ảnh đại diện'
        });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const tokenId = req.user.id;

        if (!tokenId) {
            return res.status(401).json({
                success: false,
                message: 'Không có quyền truy cập. Token không hợp lệ!'
            });
        }

        const profile = await Client.findById(tokenId).select('-Password -__v');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Khách hàng không tồn tại'
            });
        }

        return res.status(200).json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error("❌ Lỗi Get My Profile Controller:", error);

        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi lấy thông tin cá nhân',
        });
    }
};