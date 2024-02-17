const Notification = require("../models/notification");
const sendResponse = require("../utils/response");

const userController = {
    async getNotifications(req, res) {
        try {
            const { page = 1, limit = 10, unread } = req.body;

            const user_id = req.user._id;
            const skip = (page - 1) * limit;

            const query = { user_id: user_id };

            if (unread) {
                query.is_read = false;
            }

            const notifications = await Notification.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit);

            const total_count = await Notification.countDocuments(query);
            const total_pages = Math.ceil(total_count / limit);

            sendResponse(res, 200, "Notifications fetched successfully.", {
                notifications,
                pagination: {
                    total_docs: total_count,
                    total_pages: total_pages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                    hasNextPage: page < total_pages,
                    hasPrevPage: page > 1,
                },
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
            sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async markNotificationReadUnread(req, res) {
        const { notification_id } = req.params; 
        const { action } = req.body;

        if (!["read", "unread"].includes(action)) {
            return sendResponse(res, 400, "Invalid action specified.", null);
        }

        try {
            const is_read = action === "read";
            const notification = await Notification.findByIdAndUpdate(
                notification_id,
                { $set: { is_read: is_read } },
                { new: true }
            );

            if (!notification) {
                return sendResponse(res, 400, "Notification not found.", null);
            }

            sendResponse(
                res,
                200,
                `Notification marked as ${action} successfully.`,
                { notification: notification }
            );
        } catch (error) {
            console.error(`Error marking notification as ${action}:`, error);
            sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },
};

module.exports = userController;
