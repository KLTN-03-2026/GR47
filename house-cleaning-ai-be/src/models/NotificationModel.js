import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    User_Type: {
        type: String,
        enum: ['client', 'cleaner'],
        required: true
    },
    User_Id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'User_Model'
    },
    User_Model: {
        type: String,
        enum: ['Client', 'Cleaner'],
        required: true
    },
    Title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    Message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    Type: {
        type: String,
        enum: ['BOOKING', 'WALLET', 'COMPLAINT', 'SYSTEM'],
        default: 'SYSTEM'
    },
    Related_Booking_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
    },
    Is_Read: {
        type: Boolean,
        default: false
    },
    Read_At: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

notificationSchema.index({ User_Type: 1, User_Id: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
