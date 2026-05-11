import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { CLEANER_APPROVAL_STATUS, CLEANER_STATUS } from '../utils/statusUtils.js';

const { Schema } = mongoose;
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const CleanerSchema = new Schema(
    {
        Cleaner_Id: { type: Number },
        Phone_Number: { type: String, required: true, unique: true, trim: true, maxlength: 20 },
        Password: { type: String, required: true, minlength: 6, maxlength: 1024, select: false },
        Full_Name: { type: String, required: true, trim: true, maxlength: 100 },
        Address: {
            type: String,
            trim: true,
            maxlength: 255,
            default: ""
        },
        Identity_Card: { type: String, required: true, trim: true, maxlength: 255 },
        Selfie_Image: { type: String, required: true, trim: true, maxlength: 255 },
        Rating: { type: Number, required: true, default: 5.0, min: 0, max: 5 },
        Approval_Status: {
            type: Number,
            required: true,
            enum: Object.values(CLEANER_APPROVAL_STATUS),
            default: CLEANER_APPROVAL_STATUS.PENDING
        },
        Is_Online: { type: Boolean, required: true, default: false },
        Status: {
            type: Number,
            required: true,
            enum: Object.values(CLEANER_STATUS),
            default: CLEANER_STATUS.ACTIVE
        }
    },
    { timestamps: true }
);

CleanerSchema.pre('save', async function () {
    if (!this.isModified('Password')) return;
    if (/^\$2[aby]\$/.test(this.Password)) return;

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.Password = await bcrypt.hash(this.Password, salt);
});

CleanerSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.Password);
};

CleanerSchema.methods.toJSON = function () {
    const obj = this.toObject({ virtuals: false });
    delete obj.Password;
    return obj;
};

export default mongoose.models.Cleaner || mongoose.model('Cleaner', CleanerSchema);