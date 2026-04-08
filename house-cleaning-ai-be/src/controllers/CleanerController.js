// src/controllers/cleanerController.js
import Cleaner from '../models/CleanerModel.js';
import jwt from 'jsonwebtoken';
import { CLEANER_STATUS } from '../utils/statusUtils.js';

export const login = async (req, res) => {
    try {
        const { Phone_Number, Password } = req.body;

        if (!Phone_Number || !Password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp số điện thoại và mật khẩu.'
            });
        }

        const cleaner = await Cleaner.findOne({ Phone_Number }).select('+Password');

        if (!cleaner || !(await cleaner.comparePassword(Password))) {
            return res.status(401).json({
                success: false,
                message: 'Số điện thoại hoặc mật khẩu không chính xác.'
            });
        }

        if (cleaner.Status !== CLEANER_STATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn đã bị khóa hoặc không hoạt động.'
            });
        }

        const token = jwt.sign(
            {
                id: cleaner._id,
                phone: cleaner.Phone_Number,
                role: 'cleaner'
            },
            process.env.JWT_SECRET || 'fallback_secret_key_please_change',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            data: cleaner
        });

    } catch (error) {
        console.error('Cleaner Login Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi máy chủ.',
            error: error.message
        });
    }
};

export const getAllCleanersFull = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status,
            approvalStatus,
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

        if (approvalStatus) {
            query.Approval_Status = approvalStatus;
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        const sortOptions = { [sortBy]: order === 'desc' ? -1 : 1 };

        const [cleaners, totalItems] = await Promise.all([
            Cleaner.find(query).sort(sortOptions).skip(skip).limit(limitNumber),
            Cleaner.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách Cleaner thành công',
            data: cleaners,
            pagination: {
                currentPage: pageNumber,
                itemsPerPage: limitNumber,
                totalItems,
                totalPages: Math.ceil(totalItems / limitNumber)
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message
        });
    }
};

export const checkAuth = async (req, res) => {
    try {
        // req.user.id được lấy từ payload của JWT trong Middleware protect
        const cleaner = await Cleaner.findById(req.user.id);

        if (!cleaner) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản đối tác.'
            });
        }

        // Kiểm tra trạng thái hoạt động (Active/Banned/Inactive)
        if (cleaner.Status !== CLEANER_STATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn hiện đang bị khóa hoặc chưa được kích hoạt.'
            });
        }

        // Trả về dữ liệu cleaner (toJSON trong Model sẽ tự động loại bỏ Password)
        return res.status(200).json({
            success: true,
            message: 'Xác thực tài khoản thành công',
            data: cleaner
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ khi xác thực',
            error: error.message
        });
    }
};