// src/middlewares/cleanerMiddleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

const extractToken = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && String(authHeader).startsWith('Bearer ')) {
        return String(authHeader).split(' ')[1];
    }
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    return null;
};

export const protect = (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để truy cập' });
        }

        if (!JWT_SECRET) {
            return res.status(500).json({ success: false, message: 'Lỗi cấu hình máy chủ.' });
        }

        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn' });
        }

        req.user = {
            id: payload.id || payload.sub || payload.userId,
            role: payload.role || 'cleaner'
        };

        return next();
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

export const requireCleaner = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const role = String(req.user.role || '').toLowerCase();

        if (role !== 'cleaner') {
            return res.status(403).json({ success: false, message: 'Từ chối truy cập: Chỉ dành cho đối tác dọn dẹp' });
        }

        return next();
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Lỗi phân quyền' });
    }
};