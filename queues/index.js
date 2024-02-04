const updateUserStatusAgenda = require("./updateUserStatus.js");
const updateSessionStatusAgenda = require("./updateSessionStatus.js");
const sendMessageNotificationAgenda = require("./sendMessageNotification.js");

module.exports = async function () {
    updateUserStatusAgenda();
    updateSessionStatusAgenda();
    sendMessageNotificationAgenda();
};
