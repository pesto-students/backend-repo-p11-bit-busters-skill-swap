const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8000;

const connectDB = require("./config/db.js");
const allRoutes = require("./routes/index");

connectDB();
app.use(express.json());
app.use(bodyParser.json());

// Configure CORS
app.use(cors());

app.use('/', allRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
