const Joi = require('joi');

const dateGreaterThan = (ref, message) => {
    return Joi.date().greater(Joi.ref(ref)).optional().allow("").required().messages({
        'date.greater': message
    });
};

const professionalInformationSchema = Joi.object({
    role: Joi.string().optional().allow("").required(),
    industry: Joi.string().optional().allow("").required(),
    skills_to_offer: Joi.array().items(Joi.string()).required(),
    skills_seeking: Joi.array().items(Joi.string()).required(),
});

const interestsSchema = Joi.object({
    short_goal: Joi.string().optional().allow("").required(),
    long_goal: Joi.string().optional().allow("").required(),
    hobbies: Joi.array().items(Joi.string()).required(),
});

const projectSchema = Joi.object({
    title: Joi.string().optional().allow("").required(),
    link: Joi.string().uri().optional().allow("").required(),
    role: Joi.string().optional().allow("").required(),
    skills: Joi.array().items(Joi.string()).optional().allow("").required(),
    description: Joi.string().optional().allow("").required(),
    outcome: Joi.string().optional().allow("").required(),
});

const educationSchema = Joi.object({
    degree: Joi.string().optional().allow("").required(),
    institute_name: Joi.string().optional().allow("").required(),
    start_date: Joi.date().optional().allow("").required(),
    end_date: dateGreaterThan('start_date', `'end_date' must be greater than 'start_date'`),
});

const certificationSchema = Joi.object({
    title: Joi.string().optional().allow("").required(),
    issuing_organization: Joi.string().optional().allow("").required(),
    link: Joi.string().uri().optional().allow("").required(),
    issuing_date: Joi.date().optional().allow("").required(),
    expiry_date: dateGreaterThan('issuing_date', `'expiry_date' must be greater than 'issuing_date'`),
});

const userProfileSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    city: Joi.string().optional().allow("").required(),
    state: Joi.string().optional().allow("").required(),
    about: Joi.string().optional().allow("").required(),
    professional_information: professionalInformationSchema.required(),
    interests: interestsSchema.required(),
    projects: Joi.array().items(projectSchema).required(),
    education: Joi.array().items(educationSchema).required(),
    certifications: Joi.array().items(certificationSchema).required(),
});

module.exports = { userProfile: userProfileSchema };
