const AWS = require("aws-sdk");

const r2 = new AWS.S3({
endpoint: process.env.R2_URL,
accessKeyId: process.env.R2_ACCESS_KEY,
secretAccessKey: process.env.R2_SECRET_KEY,
signatureVersion: "v4",
});

module.exports = r2;