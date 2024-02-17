const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        redirect_url: {
            type: String,
            required: true,
        },
        notification_type: {
            type: String,
            required: true,
            enum: [
                "user_profile_score_updated",
                "receive_message",
                "received_session_requets",
                "session_request_accepted",
                "session_request_rejected",
                "request_review",
                "received_review",
            ],
            default: "text",
        },
        message: { 
            type: String, 
            required: true 
        },
        title: { 
            type: String, 
            required: true 
        },
        is_read: { 
            type: Boolean, 
            default: false,
        },
        date: { 
            type: Date, 
            default: Date.now 
        },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
