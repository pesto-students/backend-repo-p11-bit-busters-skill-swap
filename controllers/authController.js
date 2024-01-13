const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authController = {
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res
                    .status(400)
                    .json({ errors: { email: "User doesnt exists." } });
            }

            const checkPassword = await bcrypt.compare(password, user.password);
            if (!checkPassword) {
                return res.status(400).json({
                    errors: { email: "User credentails doesn't match." },
                });
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            return res
                .status(200)
                .json({ message: "User logged in successfully.", token, user });
        } catch (error) {
            console.error("Error login user:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    },
};

module.exports = authController;
