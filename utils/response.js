const sendResponse = (res, statusCode, message, data = null, errors = null) => {
    const response = {
        status: statusCode,
        message,
    };

    if (data) response.data = data;
    if (errors) response.errors = errors;

    return res.status(statusCode).json(response);
};

module.exports = sendResponse;
