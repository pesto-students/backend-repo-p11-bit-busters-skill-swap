const Joi = require("joi");

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        .required()
        .pattern(new RegExp("^.{3,30}$")),
});

const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
        "string.base": `"name" should be a type of 'text'`,
        "string.empty": `"name" cannot be an empty field`,
        "string.min": `"name" should have a minimum length of {#limit}`,
        "string.max": `"name" should have a maximum length of {#limit}`,
        "any.required": `"name" is a required field`,
    }),

    email: Joi.string().email().required().messages({
        "string.email": `"email" must be a valid email`,
        "string.empty": `"email" cannot be an empty field`,
        "any.required": `"email" is a required field`,
    }),

    password: Joi.string()
        .min(8)
        .pattern(new RegExp("^.{3,30}$"))
        .required()
        .messages({
            "string.min": `"password" should have a minimum length of {#limit}`,
            "string.pattern.base": `"password" should have alphanumeric characters only`,
            "any.required": `"password" is a required field`,
        }),

    confirm_password: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": `"password" does not match`,
            "any.required": `"confirm_password" is a required field`,
        }),
});

const authValidator = {
    login: loginSchema,
    register: registerSchema,
};

module.exports = authValidator;
