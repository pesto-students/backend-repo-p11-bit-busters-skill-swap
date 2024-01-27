const MessageRoom = require("../models/messageRoom");

module.exports = async function (socket) {
    socket.on("join_message_room", async (data) => {
        const room = await MessageRoom.findById(data.room_id);
        if(!room || !room?.participants?.includes(socket.user_id)){
            new Error("Invalid Room")
        }
        socket.join(`messages-${data.room_id}`);
    });
};
