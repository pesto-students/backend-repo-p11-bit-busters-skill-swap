const express = require('express');
const authRoutes = require("./authRoutes");


const app = express();

app.use("/user", authRoutes);

module.exports = app;
