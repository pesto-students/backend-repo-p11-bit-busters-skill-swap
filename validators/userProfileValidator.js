const Joi = require('joi');

const dateGreaterThan = (ref, message) => {
    return Joi.date().greater(Joi.ref(ref)).required().messages({
        'date.greater': message
    });
};

const professionalInformationSchema = Joi.object({
    role: Joi.string().required(),
    industry: Joi.string().required(),
    skills_to_offer: Joi.array().items(Joi.string()).required(),
    skills_seeking: Joi.array().items(Joi.string()).required(),
});

const interestsSchema = Joi.object({
    short_goal: Joi.string().required(),
    long_goal: Joi.string().required(),
    hobbies: Joi.array().items(Joi.string()).required(),
});

const projectSchema = Joi.object({
    title: Joi.string().required(),
    link: Joi.string().uri().required(),
    role: Joi.string().required(),
    skills: Joi.array().items(Joi.string()).required(),
    description: Joi.string().required(),
    outcome: Joi.string().required(),
});

const educationSchema = Joi.object({
    degree: Joi.string().required(),
    institute_name: Joi.string().required(),
    start_date: Joi.date().required(),
    end_date: dateGreaterThan('start_date', `'end_date' must be greater than 'start_date'`),
});

const certificationSchema = Joi.object({
    title: Joi.string().required(),
    issuing_organization: Joi.string().required(),
    link: Joi.string().uri().required(),
    issuing_date: Joi.date().required(),
    expiry_date: dateGreaterThan('issuing_date', `'expiry_date' must be greater than 'issuing_date'`),
});

const userProfileSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    about: Joi.string().required(),
    professional_information: professionalInformationSchema.required(),
    interests: interestsSchema.required(),
    projects: Joi.array().items(projectSchema).required(),
    education: Joi.array().items(educationSchema).required(),
    certifications: Joi.array().items(certificationSchema).required(),
});

module.exports = { userProfile: userProfileSchema };
