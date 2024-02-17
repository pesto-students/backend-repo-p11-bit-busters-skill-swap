// const handleChatEvents = require("./messageEvents");
const handleUserEvents = require("./userEvents");
const handleMessageRoomEvents = require("./messageRoomEvents");
const jwt = require("jsonwebtoken");

module.exports = function (io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        try {
            const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
            const user_id = decoded.userId;
            socket.user_id = user_id;
            next();
        } catch (error) {
            console.log(error);
            next(new Error("Authentication error"));
        }
    });
    io.on("connection", (socket) => {
        socket.join(`notifications-${socket.user_id}`);
        handleUserEvents(socket);
        handleMessageRoomEvents(socket);
    });
};
