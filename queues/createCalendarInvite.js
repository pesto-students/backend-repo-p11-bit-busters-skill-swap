const Agenda = require("agenda");
const axios = require("axios");
const Session = require("../models/session");
const agenda = new Agenda({
    db: {
        address: process.env.MONGODB_URI,
        collection: "queue",
    },
});

agenda.define("create Google Calendar event", async (job) => {
    try {
        const { session_id } = job.attrs.data;

        const session = await Session.findById(session_id)
            .populate({
                path: "user_id",
                select: "_id name email",
            })
            .populate({
                path: "invited_user_id",
                select: "_id name email",
            });

        const attendees = [];

        if (session?.user_id?.email) {
            attendees.push({ email: session?.user_id?.email });
        }

        if (session?.invited_user_id?.email) {
            attendees.push({ email: session?.invited_user_id?.email });
        }

        const eventData = {
            summary: "SkillSwap Session - Google Meet",
            description:
                "Congratulations on taking the next step in your SkillSwap journey! You have both expressed interest in exchanging skills and knowledge, and we're excited to facilitate this meaningful interaction.",
            start: {
                dateTime: session.start_time,
                timeZone: "Asia/Kolkata",
            },
            end: {
                dateTime: session.end_time,
                timeZone: "Asia/Kolkata",
            },
            attendees: attendees,
            reminders: {
                useDefault: false,
                overrides: [
                    { method: "email", minutes: 1440 },
                    { method: "popup", minutes: 10 },
                ],
            },
            conferenceData: {
                createRequest: {
                    requestId: session._id.toString(),
                },
            },
        };

        const apiUrl = `${process.env.GOOGLE_API_URI}/calendars/primary/events`;

        const headers = {
            Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        };

        const response = await axios.post(apiUrl, eventData, { headers });

        if (response.data) {
            const patchApiUrl = `${process.env.GOOGLE_API_URI}/calendars/primary/events/${response.data.id}?sendNotifications=true&sendUpdates=all&conferenceDataVersion=1`;

            const patch_response = await axios.patch(patchApiUrl, eventData, {
                headers,
            });

            if (patch_response.data) {
                session.meeting_link = patch_response.data.hangoutLink;
                await session.save();
            }
        }

        // console.log(response);
    } catch (error) {
        console.error(
            "Error creating event:",
            error.response ? error.response.data : error.message
        );
    }
});

agenda.start();

module.exports = agenda;
