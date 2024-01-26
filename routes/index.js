const express = require('express');
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const messageRoomRoutes = require("./messageRoomRoutes");


const app = express();

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/message_room", messageRoomRoutes);

module.exports = app;
