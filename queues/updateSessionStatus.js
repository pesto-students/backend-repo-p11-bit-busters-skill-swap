const Agenda = require("agenda");
const Session = require("../models/session");

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

        const sessions = await Session.find(query); //for notifcations
        await Session.updateMany(query, {status: 'completed'});


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
