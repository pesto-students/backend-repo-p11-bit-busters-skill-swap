const Agenda = require("agenda");
const User = require("../models/user");
const { default: axios } = require("axios");

const agenda = new Agenda({
    db: {
        address: process.env.MONGODB_URI,
        collection: "queue",
    },
});

agenda.define("update user profile", async (job) => {
    const { user_id } = job.attrs.data;
    const scores = await getScoreFromOpenAI(user_id);
    await updateUserScoreInDB(user_id, scores);
});

const getScoreFromOpenAI = async (user_id) => {
    try {
        const user = await User.findById(user_id);

        const user_string = parseUserToString(user);

        const response = await axios.post(
            `${process.env.OPENAI_URI}/v1/chat/completions`,
            {
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: `Given the detailed profile of a user, assess their skills listed under 'Skills Offered' 
                        and provide a numerical rating for each skill from 1 to 10. Your response should be in JSON format, 
                        including an explanation for each score given. The json format should be in format 
                        "[{\"score\": 10,\"skill_name\": \"JavaScript\",\"explanation\": \"explanation\"}]". Consider only the user's experience, education, and 
                        certifications for the evaluation. Please provide a comprehensive and reasoned assessment for each skill.`,
                    },
                    {
                        role: "user",
                        content: user_string,
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_TOKEN}`,
                },
            }
        );

        const scores = [];
        const content = response.data?.choices?.[0]?.message?.content;
        console.log(content);
        if (content) {
            const parsed_content = JSON.parse(content);
            parsed_content?.map((skill) => {
                scores.push({
                    skill_name: skill?.skill_name,
                    score: skill?.score,
                    explanation: skill?.explanation,
                });
            });
        }

        return scores;
    } catch (error) {
        console.error("Error calling OpenAI API:", error.message);
        throw error;
    }
};

const parseUserToString = (user) => {
    let prompt = `Name: ${user.name}\n`;
    prompt += `Role: ${user.professional_information.role}\n`;
    prompt += `Industry: ${user.professional_information.industry}\n`;
    prompt += `Skills Offered: ${user.professional_information.skills_to_offer.join(
        ", "
    )}\n`;
    prompt += `Skills Seeking: ${user.professional_information.skills_seeking.join(
        ", "
    )}\n\n`;

    prompt += `Projects:\n`;
    user.projects.forEach((project, index) => {
        prompt += `${index + 1}. Title: ${project.title}, Role: ${
            project.role
        }, Skills Used: ${project.skills.join(", ")}, Description: ${
            project.description
        }, Outcome: ${project.outcome}\n`;
    });

    prompt += `\nEducation:\n`;
    user.education.forEach((edu, index) => {
        prompt += `${index + 1}. Degree: ${edu.degree}, Institute: ${
            edu.institute_name
        }, From: ${edu?.start_date?.toISOString().split("T")[0]}, To: ${
            edu?.end_date?.toISOString().split("T")[0]
        }\n`;
    });

    prompt += `\nCertifications:\n`;
    user.certifications.forEach((cert, index) => {
        prompt += `${index + 1}. Title: ${cert.title}, Issuing Organization: ${
            cert.issuing_organization
        }, Date Issued: ${
            cert?.issuing_date?.toISOString().split("T")[0]
        }, Expiry Date: ${
            cert?.expiry_date
                ? cert?.expiry_date?.toISOString().split("T")[0]
                : "N/A"
        }\n`;
    });

    return prompt;
};

const updateUserScoreInDB = async (user_id, scores) => {
    try {
        await User.findByIdAndUpdate(user_id, {
            skill_scores: scores,
        });
    } catch (error) {
        console.error("Error udpating user score to db:", error.message);
        throw error;
    }
};

agenda.start();

module.exports = agenda;
