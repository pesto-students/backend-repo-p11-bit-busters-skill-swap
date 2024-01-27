const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        invited_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        status: {
            type: String,
            required: true,
            default: "pending",
            enum: ["pending", "accepted", "rejected", "completed"],
        },
        start_time: {
            type: Date,
            required: true,
        },
        end_time: {
            type: Date,
            required: true,
        },
        meeting_link: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
