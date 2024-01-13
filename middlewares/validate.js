const schemas = require("../validators");

const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res
                .status(400)
                .send({ message: `No schema found for ${schemaName}` });
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
            return res.status(400).send({
				status: 400,
				errors: formattedErrors
			});
        }

        next();
    };
};

module.exports = validate;
