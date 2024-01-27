const Session = require("../models/session");
const SessionReview = require("../models/sessionReview");
const sendResponse = require("../utils/response");
const MessageRoom = require("../models/messageRoom");

const sessionController = {
    async createSession(req, res) {
        try {
            const { _id } = req.user;
            const { invited_user_id, start_time, end_time } = req.body;

            const session = new Session({
                user_id: _id,
                invited_user_id,
                start_time,
                end_time,
            });

            await session.save();

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

            const session = await Session.findById(session_id);
            if (!session) {
                return sendResponse(res, 400, "Invalid Session", null, {
                    app: { message: `Invalid Session` },
                });
            }

            session.status = status;

            await session.save();

            return sendResponse(
                res,
                200,
                "Session status updated successfully.",
                { session }
            );
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

            let query = {
                $or: [{ user_id: _id }, { invited_user_id: _id }],
            };

            switch (status) {
                case "upcoming":
                    query.status = "accepted";
                    break;
                case "previous":
                    query.status = "completed";
                    break;
                case "requests":
                    query.status = "pending";
                    break;
                default:
                    break;
            }

            const sessions = await Session.find(query);

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
            const { _id } = req.user;
            const { session_id } = req.params;
            const { content, rating } = req.body;

            const session = await Session.findById(session_id);
            if (!session && !(session.user_id === _id || session.invited_user_id === _id)) {
                return sendResponse(res, 400, "Invalid Session", null, {
                    app: { message: `Invalid Session` },
                });
            }

            const review_for =
                session.user_id === _id
                    ? session.invited_user_id
                    : session.user_id;

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
