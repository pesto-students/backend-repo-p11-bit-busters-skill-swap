const Joi = require("joi");

const createSessionSchema = Joi.object({
    invited_user_id: Joi.string().required().messages({
        "string.base": `The invited user's ID must be text.`,
        "string.empty": `Please provide the invited user's ID.`,
        "any.required": `The invited user's ID is required.`,
    }),
    start_time: Joi.date().iso().required().messages({
        "date.format": `Start time is required for the session.`,
        "date.base": `Start time is required for the session..`,
        "date.empty": `Please provide a start time for the session.`,
        "any.required": `Start time is required for the session.`,
    }),
    end_time: Joi.date()
        .iso()
        .greater(Joi.ref("start_time"))
        .required()
        .messages({
            "date.base": `End time is required for the session.`,
            "date.greater": `End time must be later than the start time.`,
            "date.empty": `Please provide an end time for the session.`,
            "any.required": `End time is required for the session.`,
            "date.format": `End time is required for the session.`,
        }),
    description: Joi.string().required().allow("").messages({
        "string.base": `Description should be a valid text.`,
        "any.required": `Description is required.`,
    }),
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid("accepted", "rejected").required().messages({
        "string.base": `Status should be a valid text.`,
        "string.empty": `Please provide a status for the session.`,
        "any.only": `Status must be one of: 'accepted', 'rejected'.`,
        "any.required": `Status is required to udpate the Status.`,
    }),
});

const getSessionsSchema = Joi.object({
    status: Joi.string()
        .valid("upcoming", "previous", "requests")
        .optional()
        .allow("")
        .messages({
            "string.base": `Status should be a valid text.`,
            "any.only": `Status must be one of: 'upcoming', 'previous', 'requests'.`,
        }),
});

const addReviewSchema = Joi.object({
    content: Joi.string().required().allow("").messages({
        "string.base": `Review content should be a valid text.`,
        "string.empty": `Please provide review content.`,
        "any.required": `Review content is required.`,
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
        "number.base": `Rating should be a valid number.`,
        "number.integer": `Rating should be a whole number.`,
        "number.min": `Rating should be at least 1.`,
        "number.max": `Rating should be at most 5.`,
        "any.required": `Rating is required.`,
    }),
});

module.exports = {
    createSession: createSessionSchema,
    updateSessionStatus: updateStatusSchema,
    getSessions: getSessionsSchema,
    addReview: addReviewSchema,
};
