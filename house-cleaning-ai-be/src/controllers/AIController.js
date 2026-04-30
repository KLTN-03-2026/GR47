import { analyzeRoomWorkflow } from '../services/AIService.js';

export const analyzeRoomImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Thiếu ảnh rồi ông ơi!' });
        }

        // Gọi Bếp Trưởng (Service) ra làm việc
        const result = await analyzeRoomWorkflow(req.file.buffer, req.file.mimetype);

        // Trả kết quả cho Frontend
        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("❌ Lỗi gọi Gemini hoặc Cloudinary:", error);
        
        // Bẫy lỗi 503
        let friendlyMessage = "Lỗi Server hoặc AI: " + error.message;
        if (error.status === 503 || error.message.includes("503") || error.message.includes("high demand")) {
            friendlyMessage = "Hệ thống AI hiện đang tạm thời quá tải do lượng yêu cầu cao. Vui lòng đợi khoảng 1 phút và thử phân tích lại nhé!";
        }

        return res.status(500).json({
            success: false,
            message: friendlyMessage
        });
    }
};