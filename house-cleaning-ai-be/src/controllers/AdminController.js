// src/controllers/AdminController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/AdminModel.js';
import { ADMINSTATUS } from '../utils/statusUtils.js';

export const login = async (req, res) => {
    try {
        const { username, password } = req.body ?? {};

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username và password là bắt buộc.' });
        }

        // Lấy password (nếu schema đặt select: false cho Password)
        const admin = await Admin.findOne({
            $or: [{ Username: username }, { Email: username }],
        }).select('+Password');

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }

        // Kiểm tra trạng thái
        if (admin.Status === ADMINSTATUS.BANNED) {
            return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa.' });
        }
        if (admin.Status === ADMINSTATUS.PENDING) {
            return res.status(403).json({ success: false, message: 'Tài khoản chưa được kích hoạt.' });
        }

        const match = await bcrypt.compare(password, admin.Password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }

        const payload = {
            sub: admin._id.toString(),
            username: admin.Username,
            role: admin.Role_Level ?? 'Admin',
        };

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not set');
            return res.status(500).json({ success: false, message: 'Cấu hình server chưa đầy đủ.' });
        }

        const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
        const token = jwt.sign(payload, secret, { expiresIn });

        const adminSafe = admin.toObject();
        delete adminSafe.Password;

        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                token,
                admin: adminSafe,
            },
        });
    } catch (err) {
        console.error('Admin login error:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản quản trị viên.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Xác thực Admin thành công',
            data: admin
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message
        });
    }
};