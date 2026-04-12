import AIConfig from '../models/AIConfigModel.js';

// API Lấy cấu hình AI đang được áp dụng hiện tại (Is_Active: true)
export const getCurrentAIConfig = async (req, res) => {
    try {
        const currentConfig = await AIConfig.findOne({ Is_Active: true });

        // Nếu DB rỗng (trường hợp chưa chạy Seeder)
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

        // 1. Validate dữ liệu đầu vào
        if (!Base_Price || !Medium_Factor || !High_Factor) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đủ thông số: Base_Price, Medium_Factor, High_Factor.'
            });
        }

        // 2. Tạo một dòng cấu hình mới (Hướng 2: Lưu lịch sử)
        // Mặc định schema đã set Is_Active: true, nên Hook pre-save sẽ tự chạy và tắt các giá cũ.
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

// API Bonus: Xem lịch sử biến động giá (Cho Admin)
export const getConfigHistory = async (req, res) => {
    try {
        // Lấy tất cả lịch sử, sắp xếp ngày mới nhất lên đầu
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