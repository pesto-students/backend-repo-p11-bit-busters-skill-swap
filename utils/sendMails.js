const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const jwt = require("jsonwebtoken");
const sendResponse = require("./response");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE === "true",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});

const handlebarsOptions = {
    viewEngine: {
        extName: ".handlebars",
        partialsDir: path.resolve("./views/emails"),
        defaultLayout: false,
    },
    viewPath: path.resolve("./views/emails"),
    extName: ".handlebars",
};
transporter.use("compile", hbs(handlebarsOptions));

const sendVerificationMail = async (user) => {
    return new Promise((resolve, reject) => {
        const verification_token = jwt.sign(
            { userId: user._id },
            process.env.JWT_OTHER_SECRET,
            { expiresIn: "30m" }
        );

        const verification_url = `${process.env.APP_URL}/verify-email?token=${verification_token}`;

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: user.email,
            subject: "Email Verification",
            template: "emailVerification",
            context: {
                verification_url,
                name: user.name,
            },
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
};

module.exports = { sendVerificationMail };
