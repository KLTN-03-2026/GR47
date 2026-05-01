import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AIConfig from '../models/AIConfigModel.js';

dotenv.config({ path: '../../.env' }); 

const seedAIConfig = async () => {
    try {
        console.log('⏳ Đang kết nối MongoDB...');
        const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/house_cleaning_ai';
        await mongoose.connect(dbUri);
        console.log('✅ Kết nối Database thành công!');

        console.log('🧹 Đang xóa các cấu hình AI cũ...');
        await AIConfig.deleteMany({});

        console.log('⚙️ Đang nạp cấu hình giá mặc định (Base: 20k/m2)...');
        const defaultConfig = await AIConfig.create({
            Base_Price: 20000,
            Medium_Factor: 1.2,
            High_Factor: 1.5,
            Is_Active: true
        });

        console.log('🎉 Nạp dữ liệu cấu hình thành công!');
        console.log(defaultConfig);

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ LỖI KHI CHẠY SEEDER:', error.message);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedAIConfig();