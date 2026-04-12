import { GoogleGenerativeAI } from '@google/generative-ai';
import AIConfig from '../models/AIConfigModel.js';

// Khởi tạo Gemini SDK với Key từ .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeRoomImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Thiếu ảnh rồi ông ơi!' });
        }

        const currentConfig = await AIConfig.findOne({ Is_Active: true }) || {
            Base_Price: 20000, Medium_Factor: 1.2, High_Factor: 1.5
        };

        // 🔥 CHUẨN BỊ SẴN ẢNH BASE64 (Vừa gửi AI, vừa gửi về Frontend)
        const base64String = req.file.buffer.toString("base64");
        const mimeType = req.file.mimetype;
        const imageBase64Url = `data:${mimeType};base64,${base64String}`; // Dạng "data:image/jpeg;base64,...."

        // 1. GỌI ĐÚNG CON AI
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        // 2. GÓI ẢNH CHO GEMINI
        const imagePart = {
            inlineData: {
                data: base64String, // Dùng lại chuỗi base64 ở trên
                mimeType: mimeType
            }
        };

        const prompt = `Analyze this room. Return ONLY a JSON object: {"area": number, "clutter_level": "low"|"medium"|"high"}. Do not add any conversational text.`;

        console.log("🚀 Đang gửi ảnh cho Gemini 2.5 Flash...");

        // 3. BẮN REQUEST
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // 4. PARSE JSON VÀ TÍNH TIỀN
        const aiData = JSON.parse(responseText);
        console.log("✅ Gemini đọc xong:", aiData);

        const area = Number(aiData.area) || 20;
        const clutter_level = aiData.clutter_level || 'low';

        let multiplier = 1.0;
        if (clutter_level === 'high') multiplier = currentConfig.High_Factor;
        else if (clutter_level === 'medium') multiplier = currentConfig.Medium_Factor;

        const finalPrice = Math.round(area * currentConfig.Base_Price * multiplier);

        // 5. TRẢ VỀ FRONTEND (Kèm luôn cái ảnh nha)
        return res.status(200).json({
            success: true,
            data: {
                details: {
                    area: area,
                    clutter_status: clutter_level,
                    price_per_m2: currentConfig.Base_Price
                },
                final_price_vnd: finalPrice,
                image_url: imageBase64Url // 🔥 ẢNH TRẢ VỀ FRONTEND NẰM Ở ĐÂY LUN SẾP
            }
        });

    } catch (error) {
        console.error("❌ Lỗi gọi Gemini:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi Server hoặc AI: " + error.message
        });
    }
};