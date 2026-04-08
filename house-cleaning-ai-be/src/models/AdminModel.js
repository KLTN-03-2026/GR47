// src/models/AdminModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ADMINSTATUS } from '../utils/statusUtils.js';

const { Schema } = mongoose;
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const AdminSchema = new Schema(
    {
        Admin_Id: {
            type: Number,
            required: false,
            // If you need auto-increment numeric Admin_Id, implement a counter collection/plugin.
        },
        Username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 50,
        },
        Password: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 255,
        },
        Full_Name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        Email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            maxlength: 100,
        },
        Phone: {
            type: String,
            required: false,
            trim: true,
            maxlength: 15,
            default: null,
        },
        Avatar: {
            type: String,
            required: false,
            trim: true,
            maxlength: 255,
            default: null,
        },
        Role_Level: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20,
            default: 'Staff',
        },
        Status: {
            type: Number,
            required: true,
            default: ADMINSTATUS.ACTIVE,
            enum: Object.values(ADMINSTATUS),
        },
        Last_Login: {
            type: Date,
            required: false,
            default: null,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

/** Hash password before save when modified */
AdminSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('Password')) return next();
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        this.Password = await bcrypt.hash(this.Password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

/** Instance method to compare password */
AdminSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.Password);
};

/** Static helper to create admin with hashed password */
AdminSchema.statics.createWithHashedPassword = async function (adminData) {
    const data = { ...adminData };
    if (data.Password) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        data.Password = await bcrypt.hash(data.Password, salt);
    }
    return this.create(data);
};

/** Update last login helper */
AdminSchema.methods.updateLastLogin = async function () {
    this.Last_Login = new Date();
    return this.save();
};

/** Hide sensitive fields when converting to JSON */
AdminSchema.methods.toJSON = function () {
    const obj = this.toObject({ virtuals: false });
    delete obj.Password;
    return obj;
};

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);