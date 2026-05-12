// src/models/ClientModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { CLIENTSTATUS } from '../utils/statusUtils.js';

const { Schema } = mongoose;
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const ClientSchema = new Schema(
    {
        Client_Id: { type: Number },
        Phone_Number: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true, 
            maxlength: 20 
        },
        Password: { 
            type: String, 
            required: true, 
            minlength: 6, 
            maxlength: 1024, 
            select: false // Mặc định không hiện khi query để bảo mật
        },
        Full_Name: { 
            type: String, 
            required: true, 
            trim: true, 
            maxlength: 100 
        },
        Email: { 
            type: String, 
            trim: true, 
            lowercase: true, 
            maxlength: 100 
        },
        Gender: { 
            type: String, 
            enum: ['male', 'female', 'other', 'unknown'], 
            default: 'unknown' 
        },
        Birth_Date: { type: Date },
        
        // --- NÂNG CẤP: Address thành dạng mảng ---
        Address: [
            {
                Detail: { type: String, required: true, trim: true, maxlength: 255 },
                Is_Default: { type: Boolean, default: false }
            }
        ],
        
        Avatar: { type: String, trim: true, maxlength: 255 },
        Status: { 
            type: Number, 
            required: true, 
            default: CLIENTSTATUS.ACTIVE, 
            enum: Object.values(CLIENTSTATUS) 
        },

        /** Số dư ví CleanAI iPay (VNĐ) */
        IPay_Balance: {
            type: Number,
            default: 0,
            min: 0
        },

        // --- HỖ TRỢ OTP KHÔI PHỤC MẬT KHẨU ---
        Reset_OTP: { type: String },
        Reset_OTP_Expiry: { type: Date }
    },
    { timestamps: true } // Tự động thêm createdAt và updatedAt
);

/**
 * Middleware: Tự động băm mật khẩu trước khi lưu
 */
ClientSchema.pre('save', async function () {
    // 1. Nếu không đổi mật khẩu thì bỏ qua
    if (!this.isModified('Password')) return;

    // 2. Tránh băm lại nếu đã là mã băm bcrypt
    if (/^\$2[aby]\$/.test(this.Password)) return;

    // 3. Tiến hành băm mật khẩu
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.Password = await bcrypt.hash(this.Password, salt);
    
    // Không cần gọi next() vì Mongoose sẽ tự động hiểu khi hàm async kết thúc
});

/**
 * Method: Kiểm tra mật khẩu
 */
ClientSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.Password);
};

/**
 * Static: Tạo khách hàng với mật khẩu đã băm (cho seeding hoặc các luồng đặc biệt)
 */
ClientSchema.statics.createWithHashedPassword = async function (clientData) {
    const data = { ...clientData };
    if (data.Password && !/^\$2[aby]\$/.test(data.Password)) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        data.Password = await bcrypt.hash(data.Password, salt);
    }
    return this.create(data);
};

/**
 * toJSON: Loại bỏ các thông tin nhạy cảm khi gửi dữ liệu về phía người dùng
 */
ClientSchema.methods.toJSON = function () {
    const obj = this.toObject({ virtuals: false });
    delete obj.Password;
    delete obj.Reset_OTP;
    delete obj.Reset_OTP_Expiry;
    return obj;
};

export default mongoose.models.Client || mongoose.model('Client', ClientSchema);