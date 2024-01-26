const mongoose = require("mongoose");

const messageRoomSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

const MessageRoom = mongoose.model("MessageRoom", messageRoomSchema);

module.exports = MessageRoom;
