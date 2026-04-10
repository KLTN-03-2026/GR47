import mongoose from 'mongoose';

// Giả sử bạn định nghĩa thêm MESS_LEVEL trong utils (1: Low, 2: Medium, 3: High)
const MESS_LEVEL = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3
};

const bookingDetailSchema = new mongoose.Schema({
    Booking_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true
    },
    Image_Url: {
        type: String,
        required: true
    },
    Area_m2: {
        type: Number,
        required: true
    },
    Mess_Level: {
        type: Number,
        enum: Object.values(MESS_LEVEL),
        default: MESS_LEVEL.LOW
    },
    Price: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Booking_Detail', bookingDetailSchema);