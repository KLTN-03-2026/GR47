// src/seeders/AIConfigSeeder.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AIConfig from '../models/AIConfigModel.js';

// Nạp biến môi trường từ file .env (Lưu ý đường dẫn file .env có thể cần điều chỉnh nếu nó nằm ở thư mục ngoài cùng)
dotenv.config({ path: '../../.env' }); 

const seedAIConfig = async () => {
    try {
        // 1. Kết nối MongoDB
        console.log('⏳ Đang kết nối MongoDB...');
        // Đảm bảo biến MONGODB_URI có tồn tại trong file .env của bạn
        const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/house_cleaning_ai';
        await mongoose.connect(dbUri);
        console.log('✅ Kết nối Database thành công!');

        // 2. Dọn dẹp dữ liệu cũ trong bảng AI_Config
        console.log('🧹 Đang xóa các cấu hình AI cũ...');
        await AIConfig.deleteMany({});

        // 3. Khởi tạo dữ liệu mẫu
        console.log('⚙️ Đang nạp cấu hình giá mặc định (Base: 20k/m2)...');
        const defaultConfig = await AIConfig.create({
            Base_Price: 20000,
            Medium_Factor: 1.2,
            High_Factor: 1.5,
            Is_Active: true
        });

        console.log('🎉 Nạp dữ liệu cấu hình thành công!');
        console.log(defaultConfig);

        // 4. Đóng kết nối
        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ LỖI KHI CHẠY SEEDER:', error.message);
        mongoose.connection.close();
        process.exit(1);
    }
};

// Thực thi hàm
seedAIConfig();