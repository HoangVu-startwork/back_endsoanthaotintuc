const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
    endpoint: new AWS.Endpoint(process.env.ENDPOINT),
});

const filehtml = new AWS.S3({
    accessKeyId: process.env.UCADEMY_ACCESSKEYID,
    secretAccessKey: process.env.UCADEMY_SECRETACCESSKEY,
    endpoint: new AWS.Endpoint(process.env.UCADEMY_ENDPOINT),
})

const cloudfront = new AWS.CloudFront({
    accessKeyId: process.env.UCADEMY_ACCESSKEYID,
    secretAccessKey: process.env.UCADEMY_SECRETACCESSKEY,
    region: process.env.ENDPOINT
});

module.exports = {
    s3: s3,
    AWS: AWS,
    filehtml: filehtml,
    cloudfront: cloudfront,
};