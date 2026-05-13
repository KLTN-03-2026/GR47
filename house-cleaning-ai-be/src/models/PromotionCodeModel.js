import mongoose from 'mongoose';

const promotionCodeSchema = new mongoose.Schema(
    {
        Code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: 20
        },
        Client_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
            index: true
        },
        Booking_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true
        },
        Complaint_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BookingComplaint',
            required: true
        },
        Admin_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        },
        Discount_Percentage: {
            type: Number,
            required: true,
            min: 1,
            max: 100
        },
        Max_Discount_Amount: {
            type: Number,
            default: null,
            min: 0
        },
        Reason: {
            type: String,
            trim: true,
            maxlength: 500,
            required: true
        },
        Note: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ''
        },
        Expiry_Date: {
            type: Date,
            required: true,
            index: true
        },
        Is_Used: {
            type: Boolean,
            default: false,
            index: true
        },
        Used_At: {
            type: Date,
            default: null
        },
        Used_For_Booking_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            default: null
        },
        Is_Active: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    { timestamps: true }
);

// Compound index for querying valid promo codes
promotionCodeSchema.index({ Client_Id: 1, Is_Active: 1, Is_Used: 0, Expiry_Date: 1 });

export default mongoose.models.PromotionCode ||
    mongoose.model('PromotionCode', promotionCodeSchema);
