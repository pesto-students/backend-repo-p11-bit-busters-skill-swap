const express = require('express');
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const messageRoomRoutes = require("./messageRoomRoutes");
const sessionRoutes = require("./sessionRoutes");


const app = express();

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/message_room", messageRoomRoutes);
app.use("/sessions", sessionRoutes);

module.exports = app;
