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

// Hàm Upload Ảnh
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "house_cleaning_rooms" },
            (error, result) => { error ? reject(error) : resolve(result); }
        );
        stream.end(buffer);
    });
};

// LUỒNG XỬ LÝ CHÍNH
export const analyzeRoomWorkflow = async (fileBuffer, mimeType) => {
    const currentConfig = await AIConfig.findOne({ Is_Active: true }) || {
        Base_Price: 20000, Medium_Factor: 1.2, High_Factor: 1.5
    };

    // 1. Tải ảnh lên Cloudinary
    console.log("☁️ Đang tải ảnh lên Cloudinary...");
    const cloudinaryResult = await uploadToCloudinary(fileBuffer);
    const secureImageUrl = cloudinaryResult.secure_url;

    // 2. Chuẩn bị ảnh cho AI
    const base64String = fileBuffer.toString("base64");
    const imagePart = { inlineData: { data: base64String, mimeType: mimeType } };

    // ==========================================
    // 🔥 CHIẾN THUẬT 2 NHỊP AI (TWO-PASS AI)
    // ==========================================

    // NHỊP 1: Hỏi nhanh lấy mồi (RAG context)
    console.log("🕵️‍♂️ Nhịp 1: Đang hỏi AI xem đây là phòng gì...");
    const modelNhip1 = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: ROOM_IDENTIFICATION_PROMPT });
    const result1 = await modelNhip1.generateContent(["Đây là loại phòng gì?", imagePart]);
    const roomTypeHint = result1.response.text().trim().toLowerCase();
    console.log(`✅ AI đoán đây là phòng: "${roomTypeHint}"`);

    // NHỊP 2: Chạy RAG và đánh giá sâu
    console.log("🚀 Nhịp 2: Đang mớm mồi RAG và phân tích độ bẩn...");
    const modelNhip2 = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: getFullAssessmentPrompt(roomTypeHint), // Bơm mồi vào đây
        generationConfig: { responseMimeType: "application/json" }
    });
    const prompt2 = "Hãy phân tích căn phòng trong bức ảnh này và trả về kết quả JSON.";
    const result2 = await modelNhip2.generateContent([prompt2, imagePart]);
    const aiData = JSON.parse(result2.response.text());

    // ==========================================

    // 3. Tính tiền
    const area = Number(aiData.area) || 20;
    const clutter_level = aiData.clutter_level || 'low';
    const description = aiData.description || 'Không có mô tả chi tiết.';

    let multiplier = 1.0;
    if (clutter_level === 'high') multiplier = currentConfig.High_Factor;
    else if (clutter_level === 'medium') multiplier = currentConfig.Medium_Factor;

    const finalPrice = Math.round(area * currentConfig.Base_Price * multiplier);

    // 4. Trả về cho Controller
    return {
        details: { area, clutter_status: clutter_level, description, price_per_m2: currentConfig.Base_Price },
        final_price_vnd: finalPrice,
        image_url: secureImageUrl
    };
};