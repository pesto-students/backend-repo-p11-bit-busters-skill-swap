const Session = require("../models/session");
const User = require("../models/user");
const SessionReview = require("../models/sessionReview");
const sendResponse = require("../utils/response");
const createCalendarInviteAgenda = require("../queues/createCalendarInvite.js");
const { generateFrontendUrl } = require("../utils/frontendRoutes.js");
const { createNotification } = require("../utils/notificationUtlis.js");

const sessionController = {
    async createSession(req, res) {
        try {
            const { _id, name } = req.user;
            const { invited_user_id, start_time, end_time, description } =
                req.body;

            const session = new Session({
                user_id: _id,
                invited_user_id,
                start_time,
                end_time,
                description,
            });

            await session.save();

            const notification = {
                user_id: invited_user_id,
                redirect_url: `${generateFrontendUrl(
                    "sessions"
                )}?tab=requests&session_id=${session._id.toString()}`,
                notification_type: "received_session_requets",
                title: "New Session Request",
                message: `${name} has sent you a new request for a meeting.`,
            };
            await createNotification(notification);

            return sendResponse(res, 200, "Session created successfully.", {
                session,
            });
        } catch (error) {
            console.error("Error create session:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async updateStatus(req, res) {
        try {
            const { session_id } = req.params;
            const { status } = req.body;
            const { name } = req.user;

            const session = await Session.findById(session_id);
            if (!session) {
                return sendResponse(res, 400, "Invalid Session", null, {
                    app: { message: `Invalid Session` },
                });
            }

            session.status = status;

            await session.save();

            if (status === "accepted") {
                createCalendarInviteAgenda
                    .schedule("in 1 second", "create Google Calendar event", {
                        session_id,
                    })
                    .save();

                const notification = {
                    user_id: session.user_id,
                    redirect_url: `${generateFrontendUrl(
                        "sessions"
                    )}?tab=upcoming&session_id=${session._id.toString()}`,
                    notification_type: "session_request_accepted",
                    title: "Session Request Accepted",
                    message: `${name} has accepted your session request. Get ready to learn together!`,
                };
                await createNotification(notification);
            } else {
                const notification = {
                    user_id: session.user_id,
                    redirect_url: `${generateFrontendUrl(
                        "sessions"
                    )}?tab=requests&session_id=${session._id.toString()}`,
                    notification_type: "session_request_rejected",
                    title: "Session Request Rejected",
                    message: `Unfortunately, ${name} has declined your session request.`,
                };
                await createNotification(notification);
            }

            return sendResponse(res, 200, `Request ${status} successfully.`, {
                session,
            });
        } catch (error) {
            console.error("Error session status update:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async getSessions(req, res) {
        try {
            const { _id } = req.user;
            const { status } = req.body;

            let matchQuery = {
                $or: [{ user_id: _id }, { invited_user_id: _id }],
            };

            let sort = {};
            let group = {};
            const groupByDate = {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$start_time",
                    },
                },
                sessions: { $push: "$$ROOT" },
            };

            switch (status) {
                case "upcoming":
                    matchQuery.status = "accepted";
                    sort = { start_time: 1 };
                    group = groupByDate;
                    break;
                case "previous":
                    matchQuery.status = "completed";
                    sort = { start_time: -1 };
                    group = groupByDate;
                    break;
                case "requests":
                    matchQuery.status = { $in: ["rejected", "pending"] };
                    sort = { updatedAt: -1 };
                    break;
                default:
                    break;
            }

            let aggregationPipeline = [
                { $match: matchQuery },
                {
                    $addFields: {
                        other_user: {
                            $cond: {
                                if: { $eq: ["$user_id", _id] },
                                then: "$invited_user_id",
                                else: "$user_id",
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: "sessionreviews",
                        localField: "_id",
                        foreignField: "session_id",
                        as: "session_reviews",
                    },
                },
                {
                    $addFields: {
                        review_by_auth: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$session_reviews",
                                        as: "review",
                                        cond: {
                                            $eq: ["$$review.review_by", _id],
                                        },
                                    },
                                },
                                0,
                            ],
                        },
                        review_for_auth: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$session_reviews",
                                        as: "review",
                                        cond: {
                                            $eq: ["$$review.review_for", _id],
                                        },
                                    },
                                },
                                0,
                            ],
                        },
                    },
                },
            ];

            aggregationPipeline.push({
                $lookup: {
                    from: "users",
                    let: { otherUserId: "$other_user" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$otherUserId"],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                profile_picture: 1,
                            },
                        },
                    ],
                    as: "other_user",
                },
            });

            aggregationPipeline.push({ $unwind: "$other_user" });

            aggregationPipeline.push({ $sort: sort });
            if (status === "upcoming" || status === "previous") {
                aggregationPipeline.push({ $group: group });
            }

            const sessions = await Session.aggregate(aggregationPipeline);

            if (["upcoming", "previous"].includes(status)) {
                await Promise.all(
                    sessions.map(async (group) => {
                        await Promise.all(
                            group.sessions.map(async (session) => {
                                if (session.other_user) {
                                    session.other_user =
                                        await User.updateProfilePictureUrl(
                                            session.other_user
                                        );
                                }
                            })
                        );
                    })
                );
            } else {
                await Promise.all(
                    sessions.map(async (session) => {
                        if (session.other_user) {
                            session.other_user =
                                await User.updateProfilePictureUrl(
                                    session.other_user
                                );
                        }
                    })
                );
            }

            return sendResponse(res, 200, "Sessions fetched successfully.", {
                sessions,
                status,
            });
        } catch (error) {
            console.error("Error sessions fetching:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async addReview(req, res) {
        try {
            const { _id, name } = req.user;
            const { session_id } = req.params;
            const { content, rating } = req.body;

            const session = await Session.findById(session_id);
            if (
                !session &&
                !(
                    session.user_id.toString() === _id.toString() ||
                    session.invited_user_id.toString() === _id.toString()
                )
            ) {
                return sendResponse(res, 400, "Invalid Session", null, {
                    app: { message: `Invalid Session` },
                });
            }

            const review_for =
                session.user_id.toString() === _id.toString()
                    ? session.invited_user_id
                    : session.user_id;

            const notification = {
                user_id: review_for,
                redirect_url: `${generateFrontendUrl(
                    "sessions"
                )}?tab=completed&session_id=${session._id.toString()}`,
                notification_type: "received_review",
                title: "New Review Received",
                message: `${name}  has left you a review for your session. See what they said!`,
            };
            await createNotification(notification);

            const review = new SessionReview({
                session_id,
                review_by: _id,
                review_for,
                content,
                rating,
            });

            await review.save();

            return sendResponse(res, 200, "Review added Successfully.", {
                review,
            });
        } catch (error) {
            console.error("Error review adding:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },
};

module.exports = sessionController;
