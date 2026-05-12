import mongoose from 'mongoose';

const bookingRatingSchema = new mongoose.Schema({
    Booking_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true // Mỗi booking chỉ có 1 rating
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
        default: ""
    },
    /** Phản hồi của cleaner đối với bình luận đánh giá của khách */
    Cleaner_Reply: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ""
    },
    Cleaner_Reply_Date: {
        type: Date,
        default: null
    },
    Created_Date: {
        type: Date,
        default: Date.now
    },
    Last_Updated: {
        type: Date,
        default: Date.now
    },
    Is_Editable: {
        type: Boolean,
        default: true // true nếu < 7 ngày, false nếu ≥ 7 ngày
    },
    Is_Hidden: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('BookingRating', bookingRatingSchema);
