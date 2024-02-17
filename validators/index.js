const authValidator = require("./authValidator");
const userProfileValidator = require("./userProfileValidator");
const sessionValidators = require("./sessionValidators");

const schemas = {
    ...authValidator,
    ...userProfileValidator,
    ...sessionValidators,
};

module.exports = schemas;
