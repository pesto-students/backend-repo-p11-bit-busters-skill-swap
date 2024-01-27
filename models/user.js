const mongoose = require("mongoose");

const professionalInformationSchema = new mongoose.Schema({
    role: {
        type: String,
        default: null,
    },
    industry: {
        type: String,
        default: null,
    },
    skills_to_offer: [
        {
            type: String,
        },
    ],
    skills_seeking: [
        {
            type: String,
        },
    ],
});

const interestsSchema = new mongoose.Schema({
    short_goal: {
        type: String,
        default: null,
    },
    long_goal: {
        type: String,
        default: null,
    },
    hobbies: [
        {
            type: String,
            default: null,
        },
    ],
});

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        default: null,
    },
    link: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        default: null,
    },
    skills: [
        {
            type: String,
        },
    ],
    description: {
        type: String,
        default: null,
    },
    outcome: {
        type: String,
        default: null,
    },
});

const educationSchema = new mongoose.Schema({
    degree: {
        type: String,
        default: null,
    },
    institute_name: {
        type: String,
        default: null,
    },
    start_date: {
        type: Date,
        default: null,
    },
    end_date: {
        type: Date,
        default: null,
    },
});

const certificationSchema = new mongoose.Schema({
    title: {
        type: String,
        default: null,
    },
    issuing_organization: {
        type: String,
        default: null,
    },
    link: {
        type: String,
        default: null,
    },
    issuing_date: {
        type: Date,
        default: null,
    },
    expiry_date: {
        type: Date,
        default: null,
    },
});

const skillScoreSchema = new mongoose.Schema({
    score: {
        type: Number,
        default: null,
    },
    skill_name: {
        type: String,
    },
    explanation: {
        type: String,
        default: null,
    },
});

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        is_admin: {
            type: Boolean,
            default: false,
        },
        city: {
            type: String,
            default: null,
        },
        state: {
            type: String,
            default: null,
        },
        about: {
            type: String,
            default: null,
        },
        professional_information: professionalInformationSchema,
        interests: interestsSchema,
        projects: [projectSchema],
        education: [educationSchema],
        certifications: [certificationSchema],
        skill_scores: [skillScoreSchema],
        last_active: {
            type: Date,
            default: Date.now,
        },
        is_online: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ "professional_information.skills_to_offer": 1 });
userSchema.index({ "professional_information.skills_seeking": 1 });

userSchema.virtual("room", {
    ref: "MessageRoom",
    localField: "_id",
    foreignField: "participants",
    justOne: true,
});

userSchema.set('toObject', { virtuals: true });
userSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        delete ret.password;
        return ret;
    },
    virtuals: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;
