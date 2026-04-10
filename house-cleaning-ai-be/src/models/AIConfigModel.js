import mongoose from 'mongoose';

const AIConfigSchema = new mongoose.Schema({
    Base_Price: {
        type: Number,
        required: true,
        default: 20000
    },
    Medium_Factor: {
        type: Number,
        required: true,
        default: 1.2
    },
    High_Factor: {
        type: Number,
        required: true,
        default: 1.5
    },
    Is_Active: {
        type: Boolean,
        default: true // Mặc định khi tạo mới sẽ được áp dụng luôn
    }
}, {
    timestamps: true // Tự động sinh ra createdAt (Ngày cập nhật) và updatedAt
});

// THUẬT TOÁN TỰ ĐỘNG TẮT GIÁ CŨ
// Trước khi lưu (save) 1 dòng mới vào DB, chạy hàm này:
AIConfigSchema.pre('save', async function () {
    if (this.Is_Active) {
        await this.constructor.updateMany(
            { _id: { $ne: this._id } },
            { $set: { Is_Active: false } }
        );
    }
    // Đã xóa dòng next(); ở đây
});

export default mongoose.model('AI_Config', AIConfigSchema);