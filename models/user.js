const mongoose = require("mongoose");
const getPresignedUrl = require("../utils/getS3PresignedUrl");

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
        profile_picture: {
            type: String,
            default: null,
        },
        verified_at: {
            type: Date,
            default: null,
        }
    },
    { timestamps: true }
);

userSchema.post(/^find/, function (docs, next) {
    if (Array.isArray(docs)) {
        docs.forEach((doc) => updateFileUrl(doc));
    } else if (docs) {
        updateFileUrl(docs);
    }
    next();
});

function updateFileUrl(doc) {
    if (doc && doc.profile_picture) {
        doc.profile_picture = getPresignedUrl(doc.profile_picture);
    }
}

userSchema.statics.updateProfilePictureUrl = function (userData) {
    if (userData.profile_picture) {
        userData.profile_picture = getPresignedUrl(userData.profile_picture);
    }
    return userData;
};

userSchema.index({ email: 1 });
userSchema.index({ "professional_information.skills_to_offer": 1 });
userSchema.index({ "professional_information.skills_seeking": 1 });

userSchema.virtual("room", {
    ref: "MessageRoom",
    localField: "_id",
    foreignField: "participants",
    justOne: true,
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        delete ret.password;
        return ret;
    },
    virtuals: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
