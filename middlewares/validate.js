const schemas = require("../validators");
const sendResponse = require("../utils/response");

const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return sendResponse(res, 400, "Validation Errors.", null, {
                app: { message: `No schema found for ${schemaName}` },
            });
        }

        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const formattedErrors = error.details.reduce(
                (acc, currentError) => {
                    return setObjectValueAtPath(acc, currentError.path, {
                        message: currentError.message,
                        type: currentError.type,
                    });
                },
                {}
            );
            return sendResponse(
                res,
                400,
                "Validation Errors.",
                null,
                formattedErrors
            );
        }

        next();
    };
};

const setObjectValueAtPath = (obj, path, value) => {
    let result = Array.isArray(obj) ? [...obj] : { ...obj };

    const setValue = (current, path, value) => {
        let key = path[0];

        if (path.length === 1) {
            if (key.includes("[")) {
                const [arrayKey, arrayIndex] = key
                    .split(/\[|\]/)
                    .filter(Boolean);
                current[arrayKey][arrayIndex] = value;
            } else {
                current[key] = value;
            }
        } else {
            if (!current[key] || typeof current[key] !== "object") {
                current[key] = /^\d+$/.test(path[1]) ? [] : {};
            }
            setValue(current[key], path.slice(1), value);
        }
    };

    setValue(result, path, value);
    return result;
};

module.exports = validate;
