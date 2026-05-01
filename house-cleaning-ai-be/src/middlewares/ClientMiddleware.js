import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_please_change';

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

        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
        }

        req.user = {
            id: payload.id,
            phone: payload.phone,
            role: payload.role
        };

        return next();
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Lỗi xác thực máy chủ' });
    }
};

export const requireClient = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Chưa xác thực' });
        }

        const role = String(req.user.role || '').toLowerCase();

        if (role !== 'client') {
            return res.status(403).json({ success: false, message: 'Từ chối truy cập: Chỉ dành cho Client' });
        }

        return next();
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Lỗi phân quyền' });
    }
};