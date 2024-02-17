const User = require("../models/user");

module.exports = async function (socket) {
    socket.on("update_user_active_status", async () => {
        await User.findByIdAndUpdate(socket.user_id, {
            last_active: new Date(),
            is_online: true,
        });
    });
};
