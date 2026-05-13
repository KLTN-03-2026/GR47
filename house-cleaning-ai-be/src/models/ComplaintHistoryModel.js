import mongoose from 'mongoose';

const complaintHistorySchema = new mongoose.Schema(
    {
        Complaint_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BookingComplaint',
            required: true,
            index: true
        },
        Booking_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
            index: true
        },
        Admin_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        },
        Action_Type: {
            type: String,
            enum: [
                'CREATE',           // Khiếu nại được tạo
                'RESOLVE',          // Khiếu nại được giải quyết
                'REJECT',           // Khiếu nại bị từ chối
                'PENALIZE',         // Cleaner bị xử phạt
                'REFUND',           // Tiền được hoàn lại
                'GIFT_PROMO',       // Tặng mã khuyến mãi
                'HIDE',             // Khiếu nại bị ẩn
                'DELETE',           // Khiếu nại bị xóa
                'LIFT_PENALTY'      // Hủy xử phạt
            ],
            required: true
        },
        Old_Value: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        New_Value: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        Description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ''
        },
        Additional_Data: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        Notes: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ''
        },
        Is_Visible_To_Client: {
            type: Boolean,
            default: false
        },
        Is_Visible_To_Cleaner: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

complaintHistorySchema.index({ Admin_Id: 1, createdAt: -1 });
complaintHistorySchema.index({ Complaint_Id: 1, createdAt: -1 });

export default mongoose.models.ComplaintHistory ||
    mongoose.model('ComplaintHistory', complaintHistorySchema);
