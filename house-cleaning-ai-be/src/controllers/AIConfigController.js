import AIConfig from '../models/AIConfigModel.js';

export const getCurrentAIConfig = async (req, res) => {
    try {
        const currentConfig = await AIConfig.findOne({ Is_Active: true });

        if (!currentConfig) {
            return res.status(404).json({
                success: false,
                message: 'Hệ thống chưa có cấu hình giá nào được kích hoạt.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy cấu hình AI hiện tại thành công.',
            data: currentConfig
        });
    } catch (error) {
        console.error("Lỗi getCurrentAIConfig:", error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ khi lấy cấu hình AI.',
            error: error.message
        });
    }
};

export const updateAIConfig = async (req, res) => {
    try {
        const { Base_Price, Medium_Factor, High_Factor } = req.body;

        if (!Base_Price || !Medium_Factor || !High_Factor) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đủ thông số: Base_Price, Medium_Factor, High_Factor.'
            });
        }

        const newConfig = await AIConfig.create({
            Base_Price: Number(Base_Price),
            Medium_Factor: Number(Medium_Factor),
            High_Factor: Number(High_Factor)
        });

        return res.status(201).json({
            success: true,
            message: 'Đã cập nhật bảng giá mới thành công.',
            data: newConfig
        });

    } catch (error) {
        console.error("Lỗi updateAIConfig:", error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ khi cập nhật cấu hình.',
            error: error.message
        });
    }
};

export const getConfigHistory = async (req, res) => {
    try {
        const history = await AIConfig.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Lấy lịch sử bảng giá thành công.',
            data: history
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.', error: error.message });
    }
};