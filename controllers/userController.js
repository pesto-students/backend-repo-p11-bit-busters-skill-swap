const AWS = require("aws-sdk");
const User = require("../models/user");
const sendResponse = require("../utils/response");
const agenda = require("../queues/updateUserSkillScoreQueue");
const SessionReview = require("../models/sessionReview");

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const userController = {
    async updateProfile(req, res) {
        try {
            const { _id } = req.user;
            const data = req.body;

            data.skill_scores = [];
            await User.findByIdAndUpdate(_id, data);
            const user = await User.findById(_id);
            if (data?.professional_information?.skills_to_offer?.length > 0) {
                const queue_data = {
                    user_id: _id,
                };
                const flag = await isJobAlreadyScheduled(
                    "update user profile",
                    queue_data
                );
                if (!flag) {
                    agenda.schedule(
                        "in 2 minutes",
                        "update user profile",
                        queue_data
                    );
                }
            }

            return sendResponse(
                res,
                200,
                "Your profile is updated successfully.",
                { user }
            );
        } catch (error) {
            console.error("Error update user:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async getUserProfile(req, res) {
        try {
            const { user_id } = req.params;

            let user = req.user;
            if (user_id) {
                user = await User.findById(user_id).populate("room");
                if (!user) {
                    return sendResponse(res, 400, "Invalid User Id.", null, {
                        app: { message: "Invalid User Id." },
                    });
                }
            }

            return sendResponse(
                res,
                200,
                "User profile fetched successfully.",
                { user }
            );
        } catch (error) {
            console.error("Error get user profile:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async searchUsers(req, res) {
        try {
            const {
                skills_offering,
                skills_seeking,
                page = 1,
                limit = 10,
            } = req.body;
            const skip = (page - 1) * limit;

            const query = {
                _id: {
                    $ne: req.user._id,
                },
            };

            if (skills_offering !== "") {
                query["skill_scores.skill_name"] = skills_offering;
            }
            if (skills_seeking.length > 0) {
                query["professional_information.skills_seeking"] = {
                    $in: skills_seeking,
                };
            }

            const users = await User.find(query)
                .sort({ last_active: -1 })
                .skip(skip)
                .limit(limit);

            const total_count = await User.countDocuments(query);
            const total_pages = Math.ceil(total_count / limit);

            return sendResponse(res, 200, "Users fetched successfully.", {
                users,
                pagination: {
                    total_docs: total_count,
                    total_pages: total_pages,
                    currentPage: page,
                    limit: limit,
                    hasNextPage: page < total_pages,
                    hasPrevPage: page > 1,
                },
            });
        } catch (error) {
            console.error("Error search user:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async updateProfilePicture(req, res) {
        try {
            const { _id } = req.user;

            const profile_picture = req?.files?.profile_picture;
            const data = req.body;

            let file_url = "";

            const file_temp = profile_picture?.[0];
            if (file_temp) {
                try {
                    const file_name = `profile_pictures/${Date.now()}-${_id}-${
                        file_temp.originalname
                    }`;

                    const params = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: file_name,
                        Body: file_temp.buffer,
                    };

                    await s3.upload(params).promise();
                    file_url = `${file_name}`;
                } catch (error) {
                    console.error("Error uploading image to S3:", error);

                    return sendResponse(
                        res,
                        500,
                        "Internal server error.",
                        null,
                        {
                            app: { message: "Error uploading image." },
                        }
                    );
                }
            }
            console.log(file_url);
            if (file_url) {
                await User.findByIdAndUpdate(_id, {
                    profile_picture: file_url,
                });
            }

            const user = await User.findById(_id);

            return sendResponse(
                res,
                200,
                "Your profile picture is updated successfully.",
                { user }
            );
        } catch (error) {
            console.error("Error update profile picture user:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async getUserReviews(req, res) {
        try {
            let { user_id } = req.params;
            const { page = 1, limit = 10 } = req.body;
            const skip = (page - 1) * limit;

            if (user_id) {
                user_id = req.user._id;
            }

            const query = {
                review_for: user_id,
            };
            const reviews = await SessionReview.find(query)
                .populate({
                    path: "review_by",
                    select: "_id name professional_information.role is_online last_active profile_picture",
                })
                .skip(skip)
                .limit(limit);

            const total_count = await SessionReview.countDocuments(query);
            const total_pages = Math.ceil(total_count / limit);

            return sendResponse(
                res,
                200,
                "User reviews fetched successfully.",
                {
                    reviews,
                    pagination: {
                        total_docs: total_count,
                        total_pages: total_pages,
                        currentPage: page,
                        limit: limit,
                        hasNextPage: page < total_pages,
                        hasPrevPage: page > 1,
                    },
                }
            );
        } catch (error) {
            console.error("Error get user profile:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },
};

const isJobAlreadyScheduled = async (jobName, data) => {
    const existingJobs = await agenda.jobs({
        name: jobName,
        "data.user_id": data.user_id,
        $or: [{ nextRunAt: { $ne: null } }, { lastFinishedAt: null }],
    });

    return existingJobs.length > 0;
};

module.exports = userController;
