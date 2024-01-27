const AWS = require("aws-sdk");
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const getPresignedUrl = (key, file_name, expires = 3600) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Expires: expires,
    };
    if(file_name){
        params.ResponseContentDisposition = `attachment; filename="${file_name}"`;
    }
    return s3.getSignedUrl("getObject", params);
};

module.exports = getPresignedUrl;