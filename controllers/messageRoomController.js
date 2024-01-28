const AWS = require("aws-sdk");
const MessageRoom = require("../models/messageRoom");
const Message = require("../models/message");
const sendResponse = require("../utils/response");

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const messageRoomController = {
    async addMessage(req, res) {
        try {
            const { room_id } = req.params;
            const { _id, name } = req.user;
            const file = req?.files?.file;
            const data = req.body;

            let file_url = "";

            const file_temp = file?.[0];
            if (file_temp) {
                try {
                    const file_name = `messages_room_files/${room_id}/${Date.now()}-${
                        file_temp.originalname
                    }`;

                    const params = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: file_name,
                        Body: file_temp.buffer,
                    };

                    await s3.upload(params).promise();
                    file_url = `${file_name}`;
                } catch (error) {
                    console.error("Error uploading image to S3:", error);

                    return sendResponse(
                        res,
                        500,
                        "Internal server error.",
                        null,
                        {
                            app: { message: "Error uploading image." },
                        }
                    );
                }
            }

            const newMessageData = {
                room_id: room_id,
                sender_id: _id,
                content_type: data.content_type,
                text: data.text,
                file_url: file_url,
                file_name: file?.[0] ? file_temp.originalname : "",
                readBy: [
                    {
                        reader_id: _id,
                    },
                ],
            };

            const newMessage = new Message(newMessageData);
            await newMessage.save();

            const message = await Message.findById(newMessage._id); //to get the image url

            const room = await MessageRoom.findById(room_id);

            const receiver = room.participants.find(
                (participant) => participant.toString() !== _id.toString()
            );

            io.to(`notifications-${receiver._id}`).emit("notification", {
                message: `You have received message from ${name}`,
                type: "success",
            });

            io.to(`messages-${room._id}`).emit("new-message", {
                message,
            });

            return sendResponse(res, 200, "Message sent successfully.", {
                message,
            });
        } catch (error) {
            console.error("Error update user:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async getMessages(req, res) {
        try {
            const room_id = req.params.room_id;
            const { page = 1, limit = 5 } = req.body;
            const skip = (page - 1) * limit;

            const totalMessages = await Message.countDocuments({
                room_id: room_id,
            });
            const totalPages = Math.ceil(totalMessages / limit);

            let messages = await Message.find({ room_id: room_id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            // Reverse the order to get ascending order within the page
            messages = messages.reverse();

            const { _id } = req.user;
            const room = await MessageRoom.findById(room_id).populate({
                path: "participants",
                match: { _id: { $ne: _id } },
                select: "_id name professional_information.role is_online last_active profile_picture",
            });

            return sendResponse(res, 200, "Messages fetched successfully.", {
                messages,
                room,
                pagination: {
                    total_docs: totalMessages,
                    total_pages: totalPages,
                    currentPage: page,
                    limit: limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            });
        } catch (error) {
            console.error("Error fetching messages:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async getRooms(req, res) {
        try {
            const { _id } = req.user;
            const rooms = await MessageRoom.find({
                participants: {
                    $in: [_id],
                },
            }).populate({
                path: "participants",
                match: { _id: { $ne: _id } },
                select: "_id name professional_information.role is_online last_active profile_picture",
            });

            return sendResponse(res, 200, "Users fetched successfully.", {
                rooms,
            });
        } catch (error) {
            console.error("Error get rooms:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },

    async createRoom(req, res) {
        try {
            const { _id } = req.user;
            const { user_id } = req.body;

            const checkIfExists = await MessageRoom.findOne({
                participants: {
                    $all: [user_id, _id],
                },
            });
            let room = checkIfExists;

            if (!checkIfExists) {
                room = await MessageRoom.create({
                    participants: [user_id, _id],
                });
            }
            return sendResponse(res, 200, "You can now message to this user.", {
                room,
            });
        } catch (error) {
            console.error("Error create room:", error);
            return sendResponse(res, 500, "Internal server error.", null, {
                app: { message: "Internal server error." },
            });
        }
    },
};

module.exports = messageRoomController;
