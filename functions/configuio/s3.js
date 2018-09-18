var express = require('express');
const AWS = require('aws-sdk');

const CONFIGUIO_S3_UPLOAD = process.env.CONFIGUIO_S3_UPLOAD;
const s3 = new AWS.S3();
const s3BucketUpload = new AWS.S3({params: {Bucket: CONFIGUIO_S3_UPLOAD}});


module.exports = {};
module.exports.values = {
    'CONFIGUIO_S3_UPLOAD': CONFIGUIO_S3_UPLOAD,
    'IS_OFFLINE': process.env.IS_OFFLINE
};

module.exports.s3BucketUpload = s3BucketUpload;

module.exports.init = function(){

};

module.exports.getFileHead = async function(filename){
    const params = {Bucket: CONFIGUIO_S3_UPLOAD, Key: filename};
    let result = s3.waitFor('objectExists', params).promise();
    return result;
};

module.exports.deleteFile = function(filename){
    const params = {Bucket: CONFIGUIO_S3_UPLOAD, Key: filename};
    let result = s3.deleteObject(params).promise();
    return result;
};

module.exports.getURLBucket = async function(){
    //const params = {Bucket: CONFIGUIO_S3_UPLOAD, Key: filename};
    var data = "https://configuio-upload-dev.s3.eu-west-1.amazonaws.com/";
    return data;
};