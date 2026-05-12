import Notification from '../models/NotificationModel.js';

const modelByUserType = {
    client: 'Client',
    cleaner: 'Cleaner'
};

export const createNotification = async ({
    userType,
    userId,
    title,
    message,
    type = 'SYSTEM',
    relatedBookingId = null,
    session = null
}) => {
    if (!userType || !userId || !title || !message) return null;

    const payload = {
        User_Type: userType,
        User_Id: userId,
        User_Model: modelByUserType[userType],
        Title: title,
        Message: message,
        Type: type,
        Related_Booking_Id: relatedBookingId
    };

    if (session) {
        const docs = await Notification.create([payload], { session });
        return docs[0];
    }

    return Notification.create(payload);
};
