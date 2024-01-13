const mongoose = require("mongoose");
const moment = require("moment");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: false
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret.password; 
        return ret;
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
