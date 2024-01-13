const express = require('express');
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");


const app = express();

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

module.exports = app;
