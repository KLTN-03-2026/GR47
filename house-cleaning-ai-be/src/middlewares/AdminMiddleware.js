// src/middlewares/adminMiddleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

/**
 * Lấy token từ header Authorization Bearer hoặc cookie 'token'
 */
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

/**
 * Verify token và attach payload vào req.user
 * Trả 401 nếu token thiếu hoặc không hợp lệ
 */
export const protect = (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để truy cập' });
        }

        if (!JWT_SECRET) {
            console.error('JWT_SECRET chưa được cấu hình');
            return res.status(500).json({ success: false, message: 'Lỗi cấu hình máy chủ.' });
        }


        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn' });
        }

        // Gán thông tin user an toàn cho req.user
        req.user = {
            id: payload.id || payload.sub || payload.userId,
            role: payload.role || payload.roles || payload.roleName,
            isAdmin: payload.isAdmin || payload.admin || false,
            // thêm các claim an toàn khác nếu cần
        };

        return next();
    } catch (err) {
        return next(err);
    }
};

/**
 * Kiểm tra quyền admin, dùng sau protect
 */
export const requireAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const role = String(req.user.role || '').toLowerCase();
        const isAdmin =
            req.user.isAdmin === true ||
            role === 'admin' ||
            role === 'administrator' ||
            role === 'superadmin';

        if (!isAdmin) {
            return res.status(403).json({ message: 'Forbidden: admin only' });
        }

        return next();
    } catch (err) {
        return next(err);
    }
};