import Notification from '../models/NotificationModel.js';

const getSessionUser = (req) => {
    const basePath = req.baseUrl || '';
    const userType = basePath.includes('/cleaner') ? 'cleaner' : 'client';
    return { userType, userId: req.user?.id };
};

export const getMyNotifications = async (req, res) => {
    try {
        const { userType, userId } = getSessionUser(req);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

        const filter = { User_Type: userType, User_Id: userId };
        const [notifications, unreadCount] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean(),
            Notification.countDocuments({ ...filter, Is_Read: false })
        ]);

        return res.status(200).json({
            success: true,
            data: { notifications, unreadCount }
        });
    } catch (error) {
        console.error('getMyNotifications:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông báo', error: error.message });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const { userType, userId } = getSessionUser(req);
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, User_Type: userType, User_Id: userId },
            { Is_Read: true, Read_At: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
        }

        return res.status(200).json({ success: true, data: notification });
    } catch (error) {
        console.error('markNotificationRead:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật thông báo', error: error.message });
    }
};

export const markAllNotificationsRead = async (req, res) => {
    try {
        const { userType, userId } = getSessionUser(req);
        await Notification.updateMany(
            { User_Type: userType, User_Id: userId, Is_Read: false },
            { Is_Read: true, Read_At: new Date() }
        );

        return res.status(200).json({ success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
    } catch (error) {
        console.error('markAllNotificationsRead:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật thông báo', error: error.message });
    }
};
