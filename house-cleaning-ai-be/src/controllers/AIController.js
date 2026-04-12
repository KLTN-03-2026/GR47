import OpenAI from "openai";
import AIConfig from '../models/AIConfigModel.js';

// Khởi tạo OpenAI (Nó sẽ tự động lấy OPENAI_API_KEY từ file .env)
const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
});

export const analyzeRoomImage = async (req, res) => {
    try {
        // 1. Kiểm tra ảnh đầu vào
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ảnh.' });
        }

        // 2. Lấy cấu hình giá từ DB
        const currentConfig = await AIConfig.findOne({ Is_Active: true }) || { 
            Base_Price: 20000, 
            Medium_Factor: 1.2, 
            High_Factor: 1.5 
        };

        // 3. Chuyển ảnh sang dạng Base64
        const base64Image = req.file.buffer.toString("base64");
        const mimeType = req.file.mimetype; // ví dụ: image/jpeg, image/png
        const imageUrl = `data:${mimeType};base64,${base64Image}`;

        // 4. Gọi API OpenAI (GPT-4o-mini)
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: "Analyze this room. Return ONLY a JSON object: {\"area\": number, \"clutter_level\": \"low\"|\"medium\"|\"high\"}. No markdown, no extra text." 
                        },
                        {
                            type: "image_url",
                            image_url: {
                                "url": imageUrl
                            }
                        }
                    ]
                }
            ],
            // Ép OpenAI trả về định dạng JSON chuẩn 100%
            response_format: { type: "json_object" } 
        });

        // 5. Parse kết quả trả về
        const aiData = JSON.parse(response.choices[0].message.content);
        
        const area = Number(aiData.area) || 20;
        const clutter_level = aiData.clutter_level || 'low';

        // 6. Tính tiền
        let multiplier = 1.0;
        if (clutter_level === 'high') {
            multiplier = currentConfig.High_Factor;
        } else if (clutter_level === 'medium') {
            multiplier = currentConfig.Medium_Factor;
        }

        const finalPrice = Math.round(area * currentConfig.Base_Price * multiplier);

        // 7. Trả kết quả cho Frontend
        return res.status(200).json({
            success: true,
            data: {
                details: { 
                    estimated_area_m2: area, 
                    clutter_status: clutter_level, 
                    applied_price_m2: currentConfig.Base_Price 
                },
                final_price_vnd: finalPrice
            }
        });

    } catch (error) {
        console.error("❌ Lỗi API:", error);
        
        // Trả lỗi chi tiết để dễ debug
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi hệ thống: " + (error.message || "Không xác định")
        });
    }
};