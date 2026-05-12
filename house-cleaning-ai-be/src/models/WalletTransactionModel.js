import mongoose from 'mongoose';

const CATEGORIES = ['DEPOSIT', 'WITHDRAW', 'SPEND', 'INCOME'];

const walletTransactionSchema = new mongoose.Schema(
    {
        User_Type: {
            type: String,
            enum: ['client', 'cleaner'],
            required: true,
            index: true
        },
        User_Id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },
        Category: {
            type: String,
            enum: CATEGORIES,
            required: true,
            index: true
        },
        Amount: {
            type: Number,
            required: true,
            min: 1
        },
        Description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ''
        },
        Related_Booking_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            default: null
        }
    },
    { timestamps: true }
);

walletTransactionSchema.index({ User_Type: 1, User_Id: 1, createdAt: -1 });

export default mongoose.models.WalletTransaction ||
    mongoose.model('WalletTransaction', walletTransactionSchema);
