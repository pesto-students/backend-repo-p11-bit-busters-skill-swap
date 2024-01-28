const updateUserStatusAgenda = require("./updateUserStatus.js");
const updateSessionStatusAgenda = require("./updateSessionStatus.js");

module.exports = async function () {
    updateUserStatusAgenda();
    updateSessionStatusAgenda();
};
