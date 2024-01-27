const mongoose = require("mongoose");
const getPresignedUrl = require("../utils/getS3PresignedUrl");

const readBySchema = {
    reader_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    read_at: {
        type: Date,
        default: Date.now,
    },
};

const messageSchema = new mongoose.Schema({
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Room",
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    content_type: {
        type: String,
        required: true,
        enum: ["text", "image", "file"],
        default: "text",
    },
    text: {
        type: String,
        required: function () {
            return this.content_type === "text";
        },
    },
    file_url: {
        type: String,
        required: function () {
            return (
                this.content_type === "image" || this.content_type === "file"
            );
        },
    },
    file_name: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    readBy: [readBySchema],
});

messageSchema.post(/^find/, function(docs, next) {
    if (Array.isArray(docs)) {
        // If the result is an array of documents (e.g., find)
        docs.forEach(doc => updateFileUrl(doc));
    } else if (docs) {
        // If the result is a single document (e.g., findOne)
        updateFileUrl(docs);
    }
    next();
});

function updateFileUrl(doc) {
    if (doc && doc.file_url) {
        doc.file_url = getPresignedUrl(doc.file_url, doc.file_name);
    }
}

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
