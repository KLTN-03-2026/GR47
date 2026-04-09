// src/controllers/AIController.js

export const analyzeRoomImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ảnh.' });
        }

        const API_KEY = process.env.AI_API_KEY;
        // SỬA Ở ĐÂY: Dùng v1 thay vì v1beta
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
                // Gemini 1.5 Flash bản v1 đã hỗ trợ cực tốt response_mime_type
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
            // Nếu vẫn bị lỗi Quota (429), chúng ta sẽ nhảy xuống phần catch để dùng dữ liệu giả
            throw new Error(result.error?.message || "Lỗi API");
        }

        const aiData = JSON.parse(result.candidates[0].content.parts[0].text);
        const area = Number(aiData.area) || 20;
        const clutter_level = aiData.clutter_level || 'low';

        const BASE_PRICE_PER_M2 = 20000;
        let multiplier = clutter_level === 'high' ? 1.5 : (clutter_level === 'medium' ? 1.2 : 1.0);
        const finalPrice = Math.round(area * BASE_PRICE_PER_M2 * multiplier);

        return res.status(200).json({
            success: true,
            data: {
                details: { estimated_area_m2: area, clutter_status: clutter_level },
                final_price_vnd: finalPrice
            }
        });

    } catch (error) {
        console.error("❌ Lỗi AI:", error.message);

        // PHƯƠNG ÁN DỰ PHÒNG: Nếu AI lỗi hoặc hết tiền, vẫn trả về data để bạn code tiếp giao diện
        return res.status(200).json({
            success: true,
            message: "Hệ thống đang giả lập kết quả (AI Quota Limit).",
            data: {
                details: { estimated_area_m2: 25, clutter_status: "medium" },
                final_price_vnd: 600000 // 25 * 20000 * 1.2
            }
        });
    }
};