const Agenda = require("agenda");
const Message = require("../models/message");
const moment = require("moment");
const { createNotification } = require("../utils/notificationUtlis");
const { generateFrontendUrl } = require("../utils/frontendRoutes");

const agenda = new Agenda({
    db: {
        address: process.env.MONGODB_URI,
        collection: "queue",
    },
});

agenda.define("send message notification", async (job) => {
    try {
        console.log("sending message notifications");

        const threshold = moment().subtract(5, "minutes").toDate();

        const data = await Message.aggregate([
            {
                $match: {
                    createdAt: { $gte: threshold },
                },
            },
            {
                $group: {
                    _id: "$room_id",
                    count: { $sum: 1 },
                    senders: { $addToSet: "$sender_id" },
                },
            },
            {
                $lookup: {
                    from: "messagerooms",
                    localField: "_id",
                    foreignField: "_id",
                    as: "roomInfo",
                },
            },
            {
                $unwind: "$roomInfo",
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    room_id: "$_id",
                    senders: 1,
                    receiver: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$roomInfo.participants",
                                    as: "participant",
                                    cond: {
                                        $not: [
                                            {
                                                $in: [
                                                    "$$participant",
                                                    "$senders",
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "receiver",
                    foreignField: "_id",
                    as: "receiverDetails",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "senders",
                    foreignField: "_id",
                    as: "senderDetails",
                },
            },
            {
                $unwind: "$receiverDetails",
            },
            {
                $unwind: "$senderDetails",
            },
            {
                $project: {
                    count: 1,
                    room_id: 1,
                    receiver_id: "$receiver",
                    receiver_name: "$receiverDetails.name",
                    sender_name: "$senderDetails.name",
                },
            },
        ]);

        await data.map(async (noti) => {
            const notification = {
                user_id: noti.receiver_id.toString(),
                redirect_url: generateFrontendUrl("messages", {
                    room_id: noti.room_id.toString(),
                }),
                notification_type: "receive_message",
                title: "New Message Received",
                message: `You have ${noti.count} new message from ${noti.sender_name}. Check it out!`,
            };
            await createNotification(notification);
        });
    } catch (error) {
        console.error("Error updating session status:", error.message);
        throw error;
    }
});

const updateSessionStatusAgenda = async () => {
    await agenda.start();

    await agenda.cancel({ name: "send message notification" });
    await agenda.every("5 minutes", "send message notification");
};

module.exports = updateSessionStatusAgenda;
