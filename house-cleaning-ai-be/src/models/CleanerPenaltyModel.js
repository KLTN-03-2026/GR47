import mongoose from 'mongoose';

const cleanerPenaltySchema = new mongoose.Schema(
    {
        Cleaner_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cleaner',
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
        Penalty_Type: {
            type: String,
            enum: ['LOCK_5_MIN', 'LOCK_30_MIN', 'LOCK_1_HOUR', 'LOCK_6_HOUR', 'LOCK_24_HOUR', 'ACCOUNT_LOCK'],
            required: true
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
        Penalty_Start_Date: {
            type: Date,
            default: () => new Date(),
            required: true
        },
        Penalty_End_Date: {
            type: Date,
            required: true
        },
        Is_Active: {
            type: Boolean,
            default: true,
            index: true
        },
        Lifted_At: {
            type: Date,
            default: null
        },
        Lifted_Reason: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ''
        }
    },
    { timestamps: true }
);

// Index for querying active penalties
cleanerPenaltySchema.index({ Cleaner_Id: 1, Is_Active: 1, Penalty_End_Date: 1 });

export default mongoose.models.CleanerPenalty ||
    mongoose.model('CleanerPenalty', cleanerPenaltySchema);
