import mongoose from 'mongoose';

const bookingComplaintSchema = new mongoose.Schema({
    Booking_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true
    },
    Client_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    Cleaner_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cleaner',
        required: true
    },
    Rating_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookingRating',
        default: null
    },
    Stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        enum: [1, 2, 3, 4, 5]
    },
    Comment: {
        type: String,
        trim: true,
        maxlength: 300,
        default: ''
    },
    Reason: {
        type: String,
        trim: true,
        required: true,
        maxlength: 120
    },
    Detail: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },
    Status: {
        type: String,
        enum: ['PENDING', 'RESOLVED', 'REJECTED'],
        default: 'PENDING'
    },
    Admin_Note: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },
    Is_Refunded: {
        type: Boolean,
        default: false
    },
    Is_Review_Hidden: {
        type: Boolean,
        default: false
    },
    Is_Hidden: {
        type: Boolean,
        default: false,
        index: true
    },
    Resolved_Date: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

bookingComplaintSchema.index({ Client_Id: 1, Is_Hidden: 1 });
bookingComplaintSchema.index({ Cleaner_Id: 1, Is_Hidden: 1 });

export default mongoose.models.BookingComplaint || mongoose.model('BookingComplaint', bookingComplaintSchema);
