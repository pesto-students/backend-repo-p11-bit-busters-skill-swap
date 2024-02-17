const Agenda = require("agenda");
const User = require("../models/user");

const agenda = new Agenda({
    db: {
        address: process.env.MONGODB_URI,
        collection: "queue",
    },
});

agenda.define("update user status", async (job) => {
    try {
        const threshold = new Date(new Date().getTime() - 60000); // 60 seconds ago
        console.log("Updating user status");
        await User.updateMany(
            { last_active: { $lt: threshold } },
            { is_online: false }
        );
    } catch (error) {
        console.error("Error updating user status:", error.message);
        throw error;
    }
});

const updateUserStatusAgenda = async () => {
    await agenda.start();

    await agenda.cancel({ name: "update user status" });
    await agenda.every("1 minute", "update user status");
};

module.exports = updateUserStatusAgenda;
