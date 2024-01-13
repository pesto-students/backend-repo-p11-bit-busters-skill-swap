const jwt = require("jsonwebtoken");
const User = require("../models/user");

const isAdmin = async (req, res, next) => {
    const { user } = req;

    try {
        if (!user.is_admin) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        req.user = user;

        next();
    } catch (err) {
        return res.status(403).json({ message: "Unauthorized access" });
    }
};

module.exports = isAdmin;
