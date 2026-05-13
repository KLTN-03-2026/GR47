import ComplaintHistory from '../models/ComplaintHistoryModel.js';
import { createNotification } from './notificationService.js';

/**
 * Log complaint action history
 */
export const logComplaintAction = async ({
    complaintId,
    bookingId,
    adminId,
    actionType,
    oldValue = null,
    newValue = null,
    description = '',
    additionalData = null,
    notes = '',
    isVisibleToClient = false,
    isVisibleToCleaner = false,
    session = null
}) => {
    const payload = {
        Complaint_Id: complaintId,
        Booking_Id: bookingId,
        Admin_Id: adminId,
        Action_Type: actionType,
        Old_Value: oldValue,
        New_Value: newValue,
        Description: description,
        Additional_Data: additionalData,
        Notes: notes,
        Is_Visible_To_Client: isVisibleToClient,
        Is_Visible_To_Cleaner: isVisibleToCleaner
    };

    if (session) {
        const docs = await ComplaintHistory.create([payload], { session });
        return docs[0];
    }

    return ComplaintHistory.create(payload);
};

/**
 * Calculate penalty end date based on penalty type
 */
export const calculatePenaltyEndDate = (penaltyType) => {
    const now = new Date();
    const durations = {
        'LOCK_5_MIN': 5 * 60 * 1000,
        'LOCK_30_MIN': 30 * 60 * 1000,
        'LOCK_1_HOUR': 60 * 60 * 1000,
        'LOCK_6_HOUR': 6 * 60 * 60 * 1000,
        'LOCK_24_HOUR': 24 * 60 * 60 * 1000
    };

    if (durations[penaltyType]) {
        return new Date(now.getTime() + durations[penaltyType]);
    }

    return null;
};

/**
 * Get penalty duration display text
 */
export const getPenaltyDurationText = (penaltyType) => {
    const durations = {
        'LOCK_5_MIN': '5 phút',
        'LOCK_30_MIN': '30 phút',
        'LOCK_1_HOUR': '1 giờ',
        'LOCK_6_HOUR': '6 giờ',
        'LOCK_24_HOUR': '24 giờ',
        'ACCOUNT_LOCK': 'Vô thời hạn'
    };

    return durations[penaltyType] || 'Không xác định';
};

/**
 * Send complaint action notifications to both client and cleaner
 */
export const sendComplaintActionNotifications = async ({
    complaintId,
    bookingId,
    clientId,
    cleanerId,
    actionType,
    title,
    message,
    session = null
}) => {
    const notificationPromises = [
        createNotification({
            userType: 'client',
            userId: clientId,
            title: title,
            message: message,
            type: 'COMPLAINT',
            relatedBookingId: bookingId,
            session
        }),
        createNotification({
            userType: 'cleaner',
            userId: cleanerId,
            title: title,
            message: message,
            type: 'COMPLAINT',
            relatedBookingId: bookingId,
            session
        })
    ];

    await Promise.all(notificationPromises);
};

/**
 * Validate promotion code data
 */
export const validatePromoCodeData = (discountPercentage, maxDiscountAmount, expiryDate) => {
    const errors = [];

    if (!discountPercentage || discountPercentage < 1 || discountPercentage > 100) {
        errors.push('Phần trăm giảm giá phải từ 1-100%');
    }

    if (maxDiscountAmount !== null && maxDiscountAmount !== undefined && maxDiscountAmount < 0) {
        errors.push('Giá trị giảm tối đa không được âm');
    }

    if (!expiryDate || new Date(expiryDate) <= new Date()) {
        errors.push('Ngày hết hạn phải lớn hơn hôm nay');
    }

    return errors;
};

/**
 * Generate unique promotion code
 */
export const generatePromoCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `COMP${timestamp}${random}`.substring(0, 20);
};
