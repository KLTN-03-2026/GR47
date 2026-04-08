// src/models/ClientModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { CLIENTSTATUS } from '../utils/statusUtils.js';

const { Schema } = mongoose;
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const ClientSchema = new Schema(
    {
        Client_Id: { type: Number },
        Phone_Number: { type: String, required: true, unique: true, trim: true, maxlength: 20 },
        Password: { type: String, required: true, minlength: 6, maxlength: 1024, select: false },
        Full_Name: { type: String, required: true, trim: true, maxlength: 100 },
        Email: { type: String, trim: true, lowercase: true, maxlength: 100 },
        Gender: { type: String, enum: ['male', 'female', 'other', 'unknown'], default: 'unknown' },
        Birth_Date: { type: Date },
        Address: { type: String, trim: true, maxlength: 255, default: 'Địa chỉ mặc định' },
        Avatar: { type: String, trim: true, maxlength: 255 },
        Status: { type: Number, required: true, default: CLIENTSTATUS.ACTIVE, enum: Object.values(CLIENTSTATUS) }
    },
    { timestamps: true }
);

/**
 * Pre-save hook: async, không nhận next
 * Hash password khi trường Password bị thay đổi
 */
ClientSchema.pre('save', async function () {
    if (!this.isModified('Password')) return;

    // 👉 THÊM DÒNG NÀY: Kiểm tra nếu đã là hash bcrypt thì bỏ qua
    if (/^\$2[aby]\$/.test(this.Password)) return;

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.Password = await bcrypt.hash(this.Password, salt);
});

/**
 * Instance method: so sánh mật khẩu
 * Dùng function để this trỏ đúng document
 */
ClientSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.Password);
};

/**
 * Static helper: tạo client với password đã hash (dùng khi muốn tạo programmatically)
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
 * toJSON: loại bỏ trường nhạy cảm khi trả về client
 */
ClientSchema.methods.toJSON = function () {
    const obj = this.toObject({ virtuals: false });
    delete obj.Password;
    return obj;
};

export default mongoose.models.Client || mongoose.model('Client', ClientSchema);