const jwt = require("jsonwebtoken");
const User = require("../models/user");

const isAdmin = async (req, res, next) => {
    const { user } = req;

    try {
        if (!user.is_admin) {
            return sendResponse(res, 403, "Unauthorized access", null, {
                app: { message: "Unauthorized access" }
            });
        }

        req.user = user;

        next();
    } catch (err) {
        return sendResponse(res, 403, "Unauthorized access", null, {
            app: { message: "Unauthorized access" }
        });
    }
};

module.exports = isAdmin;
