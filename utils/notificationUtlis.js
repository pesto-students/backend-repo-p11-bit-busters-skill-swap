const Notification = require("../models/notification");

async function createNotification(data) {
    try {
        const notification = new Notification({
            user_id: data.user_id,
            redirect_url: data.redirect_url,
            notification_type: data.notification_type,
            message: data.message,
            title: data.title,
        });

        const savedNotification = await notification.save();
        return savedNotification;
    } catch (error) {
        console.error("Error saving notification:", error);
        throw error;
    }
}

module.exports = { createNotification };
