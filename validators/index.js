const authValidator = require("./authValidator");
const userProfileValidator = require("./userProfileValidator");

const schemas = {
    ...authValidator,
    ...userProfileValidator,
};

module.exports = schemas;
