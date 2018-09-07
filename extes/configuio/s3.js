var express = require('express');
const AWS = require('aws-sdk');

const s3BucketUpload = new AWS.S3({params: {Bucket: process.env.CONFIGUIO_S3_UPLOAD}});


module.exports = {};
module.exports.values = {
    'CONFIGUIO_S3_UPLOAD': process.env.CONFIGUIO_S3_UPLOAD,
    'IS_OFFLINE': process.env.IS_OFFLINE
};

module.exports.s3BucketUpload = s3BucketUpload;

module.exports.init = function(){

};