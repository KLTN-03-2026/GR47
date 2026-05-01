import { GoogleGenerativeAI } from '@google/generative-ai';
import { v2 as cloudinary } from 'cloudinary';
import AIConfig from '../models/AIConfigModel.js';
import { ROOM_IDENTIFICATION_PROMPT, getFullAssessmentPrompt } from '../data/dataAILearning/systemPrompts.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'house_cleaning_rooms' },
            (error, result) => { error ? reject(error) : resolve(result); }
        );
        stream.end(buffer);
    });
};

const analyzeRoomWorkflow = async (fileBuffer, mimeType) => {
    const currentConfig = await AIConfig.findOne({ Is_Active: true }) || {
        Base_Price: 20000,
        Medium_Factor: 1.2,
        High_Factor: 1.5
    };

    const cloudinaryResult = await uploadToCloudinary(fileBuffer);
    const secureImageUrl = cloudinaryResult.secure_url;

    const base64String = fileBuffer.toString('base64');
    const imagePart = { inlineData: { data: base64String, mimeType } };

    const modelNhip1 = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: ROOM_IDENTIFICATION_PROMPT });
    const result1 = await modelNhip1.generateContent(['Đây là loại phòng gì?', imagePart]);
    const roomTypeHint = result1.response.text().trim().toLowerCase();

    const modelNhip2 = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: getFullAssessmentPrompt(roomTypeHint),
        generationConfig: { responseMimeType: 'application/json' }
    });
    const prompt2 = 'Hãy phân tích căn phòng trong bức ảnh này và trả về kết quả JSON.';
    const result2 = await modelNhip2.generateContent([prompt2, imagePart]);
    const aiData = JSON.parse(result2.response.text());

    const area = Number(aiData.area) || 20;
    const clutter_level = aiData.clutter_level || 'low';
    const description = aiData.description || 'Không có mô tả chi tiết.';

    let multiplier = 1.0;
    if (clutter_level === 'high') multiplier = currentConfig.High_Factor;
    else if (clutter_level === 'medium') multiplier = currentConfig.Medium_Factor;

    const finalPrice = Math.round(area * currentConfig.Base_Price * multiplier);

    return {
        details: {
            area,
            clutter_status: clutter_level,
            description,
            price_per_m2: currentConfig.Base_Price
        },
        final_price_vnd: finalPrice,
        image_url: secureImageUrl
    };
};

export const analyzeRoomImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Thiếu ảnh rồi ông ơi!' });
        }

        const result = await analyzeRoomWorkflow(req.file.buffer, req.file.mimetype);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Lỗi gọi Gemini hoặc Cloudinary:', error);
        let friendlyMessage = 'Lỗi Server hoặc AI: ' + error.message;
        if (error.status === 503 || error.message.includes('503') || error.message.includes('high demand')) {
            friendlyMessage = 'Hệ thống AI hiện đang tạm thời quá tải do lượng yêu cầu cao. Vui lòng đợi khoảng 1 phút và thử phân tích lại nhé!';
        }

        return res.status(500).json({
            success: false,
            message: friendlyMessage
        });
    }
};