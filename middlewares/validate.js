const schemas = require("../validators");
const sendResponse = require('../utils/response');

const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return sendResponse(res, 400, "Validation Errors.", null, {
                app: { message: `No schema found for ${schemaName}` }
            });
        }

        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const formattedErrors = error.details.reduce(
                (acc, currentError) => {
                    const key = currentError.path.join(".");

                    acc[key] = {
                        message: currentError.message,
                        type: currentError.type,
                    };

                    return acc;
                },
                {}
            );
            return sendResponse(res, 400, "Validation Errors.", null, formattedErrors);
        }

        next();
    };
};

module.exports = validate;
