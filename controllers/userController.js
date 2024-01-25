const User = require("../models/user");
const sendResponse = require("../utils/response");
const agenda = require("../queues/updateUserSkillScoreQueue");

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
                user = await User.findById(user_id);
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

            if(skills_offering !== '' ){
                query["skill_scores.skill_name"] = skills_offering;
            }
            if(skills_seeking.length > 0){
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
