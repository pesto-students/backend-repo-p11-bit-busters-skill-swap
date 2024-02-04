const Agenda = require("agenda");
const Session = require("../models/session");
const { generateFrontendUrl } = require("../utils/frontendRoutes");
const { createNotification } = require("../utils/notificationUtlis");

const agenda = new Agenda({
    db: {
        address: process.env.MONGODB_URI,
        collection: "queue",
    },
});

agenda.define("update session status", async (job) => {
    try {
        const threshold = new Date();
        console.log("Updating session status");

        const query = { end_time: { $lt: threshold }, status: "accepted" };

        const sessions = await Session.find(query).populate(["user_id" , "invited_user_id"]); 
        await Session.updateMany(query, {status: 'completed'});
        await sessions.map(async (session) => {
            const notification = {
                user_id: session.user_id._id,
                redirect_url: `${generateFrontendUrl(
                    "sessions"
                )}?tab=completed&session_id=${session._id.toString()}`,
                notification_type: "request_review",
                title: "Share Your Feedback",
                message: `How was your session with ${session.invited_user_id.name}? We'd love to hear your thoughts. Please share your feedback.`,
            };
            await createNotification(notification);

            const notification2 = {
                user_id: session.invited_user_id._id,
                redirect_url: `${generateFrontendUrl(
                    "sessions"
                )}?tab=completed&session_id=${session._id.toString()}`,
                notification_type: "request_review",
                title: "Share Your Feedback",
                message: `How was your session with ${session.user_id.name}? We'd love to hear your thoughts. Please share your feedback.`,
            };
            await createNotification(notification2);
        })

        const pending_query = { end_time: { $lt: threshold }, status: "pending" };
        await Session.updateMany(pending_query, {status: 'rejected'});
    } catch (error) {
        console.error("Error updating session status:", error.message);
        throw error;
    }
});

const updateSessionStatusAgenda = async () => {
    await agenda.start();

    await agenda.cancel({ name: "update session status" });
    await agenda.every("15 minutes", "update session status");
};

module.exports = updateSessionStatusAgenda;
