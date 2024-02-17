const express = require("express");
require("dotenv").config();
require('newrelic');
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");

const connectDB = require("./config/db.js");
const allRoutes = require("./routes/index");
const socketEvents = require("./socketEvents/index.js");
const queues = require("./queues/index.js");

const app = express();
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);
global.io = socketIo(server, {
    cors: {
        origin: process.env.APP_URL,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    },
});

connectDB();
app.use(express.json());
app.use(bodyParser.json());

// Configure CORS
app.use(cors());

app.use("/", allRoutes);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

socketEvents(io);
queues();
