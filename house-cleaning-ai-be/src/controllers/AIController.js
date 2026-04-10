// src/controllers/AIController.js
import AIConfig from '../models/AIConfigModel.js'; // Nhớ import Model cấu hình vào nhé!

export const analyzeRoomImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ảnh.' });
        }

        // 1. LẤY CẤU HÌNH GIÁ MỚI NHẤT TỪ DATABASE
        let currentConfig = await AIConfig.findOne({ Is_Active: true });

        // Nếu lỡ Database trống chưa có dòng nào, tạo luôn fallback mặc định để code không bị "chết"
        if (!currentConfig) {
            currentConfig = { Base_Price: 20000, Medium_Factor: 1.2, High_Factor: 1.5 };
        }

        // 2. GỌI API GEMINI AI
        const API_KEY = process.env.AI_API_KEY;
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        const base64Image = req.file.buffer.toString("base64");

        const payload = {
            contents: [{
                parts: [
                    { text: "Phân tích ảnh và trả về JSON: {\"area\": number, \"clutter_level\": \"low\"|\"medium\"|\"high\"}. Không trả thêm text khác." },
                    {
                        inline_data: {
                            mime_type: req.file.mimetype,
                            data: base64Image
                        }
                    }
                ]
            }],
            generationConfig: {
                response_mime_type: "application/json"
            }
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || "Lỗi API");
        }

        const aiData = JSON.parse(result.candidates[0].content.parts[0].text);
        const area = Number(aiData.area) || 20;
        const clutter_level = aiData.clutter_level || 'low';

        // 3. TÍNH TOÁN GIÁ DỰA TRÊN DATABASE CHUẨN
        let multiplier = 1.0;
        if (clutter_level === 'high') {
            multiplier = currentConfig.High_Factor;
        } else if (clutter_level === 'medium') {
            multiplier = currentConfig.Medium_Factor;
        }

        const finalPrice = Math.round(area * currentConfig.Base_Price * multiplier);

        return res.status(200).json({
            success: true,
            data: {
                details: {
                    estimated_area_m2: area,
                    clutter_status: clutter_level,
                    applied_price_m2: currentConfig.Base_Price // Trả về thêm để FE dễ hiển thị nếu cần
                },
                final_price_vnd: finalPrice
            }
        });

    } catch (error) {
        console.error("❌ Lỗi AI:", error.message);

        // 4. PHƯƠNG ÁN DỰ PHÒNG: Lấy tạm cấu hình từ DB để tính giá giả lập
        // Dùng lệnh lặp lại một chút vì biến currentConfig ở trên nằm trong khối try
        let backupConfig = await AIConfig.findOne({ Is_Active: true }) || { Base_Price: 20000, Medium_Factor: 1.2 };

        const fallbackArea = 25; // Giả lập phòng 25m2
        const fallbackClutter = "medium";
        const fallbackPrice = Math.round(fallbackArea * backupConfig.Base_Price * backupConfig.Medium_Factor);

        return res.status(200).json({
            success: true,
            message: "Hệ thống đang giả lập kết quả (AI Quota Limit).",
            data: {
                details: {
                    estimated_area_m2: fallbackArea,
                    clutter_status: fallbackClutter,
                    applied_price_m2: backupConfig.Base_Price
                },
                final_price_vnd: fallbackPrice
            }
        });
    }
};