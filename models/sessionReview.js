const mongoose = require("mongoose");

const sessionReviewSchema = new mongoose.Schema(
    {
        session_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Session",
        },
        review_by: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        review_for: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        content: {
            type: String,
            default: null,
        },
        rating: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const SessionReview = mongoose.model("SessionReview", sessionReviewSchema);

module.exports = SessionReview;
