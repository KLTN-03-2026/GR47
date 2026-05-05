// src/controllers/cleanerController.js
import Cleaner from '../models/CleanerModel.js';
import jwt from 'jsonwebtoken';
import { CLEANER_STATUS, CLEANER_APPROVAL_STATUS } from '../utils/statusUtils.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImageToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'cleaner_selfies',
                resource_type: 'image'
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};

export const register = async (req, res) => {
    try {
        const { Phone_Number, Password, Full_Name } = req.body;

        if (!Phone_Number || !Password || !Full_Name) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ các thông tin cá nhân bắt buộc!'
            });
        }

        if (!req.files || !req.files['Selfie_Image'] || !req.files['Identity_Card']) {
            return res.status(400).json({
                success: false,
                message: 'Hồ sơ còn thiếu ảnh chân dung hoặc ảnh căn cước công dân!'
            });
        }

        const existingCleaner = await Cleaner.findOne({ Phone_Number });
        if (existingCleaner) {
            return res.status(409).json({
                success: false,
                message: 'Số điện thoại này đã tồn tại trong hệ thống CleanAI!'
            });
        }

        const [selfieResult, identityCardResult] = await Promise.all([
            uploadImageToCloudinary(req.files['Selfie_Image'][0].buffer, 'cleaner_selfies'),
            uploadImageToCloudinary(req.files['Identity_Card'][0].buffer, 'cleaner_docs')
        ]);

        const newCleaner = new Cleaner({
            Phone_Number,
            Password,
            Full_Name,
            Selfie_Image: selfieResult.secure_url,
            Identity_Card: identityCardResult.secure_url,
            Status: CLEANER_STATUS.ACTIVE,
            Approval_Status: CLEANER_APPROVAL_STATUS.PENDING
        });

        await newCleaner.save();

        return res.status(201).json({
            success: true,
            message: 'Đăng ký thành công! Hồ sơ của bạn đã được chuyển đến ban quản trị để phê duyệt.',
            data: newCleaner
        });

    } catch (error) {
        console.error('Lỗi thực thi quy trình đăng ký:', error);
        return res.status(500).json({
            success: false,
            message: 'Máy chủ gặp sự cố khi xử lý hồ sơ nhân viên',
            chi_tiet_loi: error.message
        });
    }
};

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

        // 1. Kiểm tra trạng thái tài khoản (Có bị khóa/Banned hay không)
        if (cleaner.Status !== CLEANER_STATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn hiện đang bị khóa. Vui lòng liên hệ quản trị viên!'
            });
        }

        // 2. Kiểm tra trạng thái phê duyệt hồ sơ (Quan trọng nhất đây sếp ơi!)
        if (cleaner.Approval_Status === CLEANER_APPROVAL_STATUS.PENDING) {
            return res.status(403).json({
                success: false,
                message: 'Hồ sơ của bạn vẫn đang trong quá trình xét duyệt. Vui lòng quay lại sau nhé!'
            });
        }

        if (cleaner.Approval_Status === CLEANER_APPROVAL_STATUS.REJECTED) {
            return res.status(403).json({
                success: false,
                message: 'Rất tiếc, hồ sơ đăng ký của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin!'
            });
        }

        // 3. Nếu mọi thứ đều ổn (Phải là Active/Approved) thì mới cấp Token
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
            message: 'Đăng nhập thành công! Chào mừng bạn trở lại với CleanAI.',
            token,
            data: cleaner
        });

    } catch (error) {
        console.error('❌ Lỗi Đăng nhập Cleaner:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi hệ thống khi xử lý đăng nhập.',
            loi_chi_tiet: error.message
        });
    }
};

export const getAllCleanersFull = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status, sortBy = 'createdAt', order = 'desc' } = req.query;

        const query = { Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE };

        if (search) {
            query.$or = [
                { Full_Name: { $regex: search, $options: 'i' } },
                { Phone_Number: { $regex: search, $options: 'i' } }
            ];
        }

        if (status !== undefined && status !== '') {
            query.Status = Number(status);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: order === 'desc' ? -1 : 1 };

        const [cleaners, totalItems] = await Promise.all([
            Cleaner.find(query).sort(sortOptions).skip(skip).limit(parseInt(limit)),
            Cleaner.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: cleaners,
            pagination: {
                currentPage: parseInt(page),
                totalItems,
                totalPages: Math.ceil(totalItems / parseInt(limit))
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
        const cleaner = await Cleaner.findById(req.user.id);

        if (!cleaner) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản đối tác.'
            });
        }

        if (cleaner.Status !== CLEANER_STATUS.ACTIVE) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn hiện đang bị khóa hoặc chưa được kích hoạt.'
            });
        }

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

export const getAllPendingCleaners = async (req, res) => {
    try {
        const pendingCleaners = await Cleaner.find({
            Approval_Status: CLEANER_APPROVAL_STATUS.PENDING
        })
            .select('-Password -__v')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách nhân viên chờ duyệt thành công!',
            count: pendingCleaners.length,
            data: pendingCleaners
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi lấy danh sách nhân viên chờ duyệt',
            chi_tiet_loi: error.message
        });
    }
};

export const approveCleaner = async (req, res) => {
    try {
        const { id } = req.params;

        const cleaner = await Cleaner.findByIdAndUpdate(
            id,
            { Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE },
            { new: true }
        );

        if (!cleaner) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hồ sơ nhân viên này trong hệ thống để phê duyệt!'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Hồ sơ của nhân viên ${cleaner.Full_Name} đã được phê duyệt thành công!`,
            data: cleaner
        });

    } catch (error) {
        console.error('Lỗi trong quá trình phê duyệt nhân viên:', error);
        return res.status(500).json({
            success: false,
            message: 'Máy chủ gặp sự cố khi thực hiện phê duyệt hồ sơ',
            chi_tiet_loi: error.message
        });
    }
};

export const lockAndUnlockCleaner = async (req, res) => {
    try {
        const { id } = req.params;

        const cleaner = await Cleaner.findById(id);

        if (!cleaner) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hồ sơ nhân viên để thực hiện thao tác!'
            });
        }

        const newStatus = cleaner.Status === CLEANER_STATUS.ACTIVE
            ? CLEANER_STATUS.BANNED
            : CLEANER_STATUS.ACTIVE;

        cleaner.Status = newStatus;
        await cleaner.save();

        const statusMessage = newStatus === CLEANER_STATUS.ACTIVE ? 'mở khóa' : 'khóa';

        return res.status(200).json({
            success: true,
            message: `Đã ${statusMessage} tài khoản của nhân viên ${cleaner.Full_Name} thành công!`,
            data: cleaner
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi thay đổi trạng thái tài khoản',
            error: error.message
        });
    }
};