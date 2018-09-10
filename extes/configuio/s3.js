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

module.exports.getFileHead = function(filename, callback){
    var params = {Bucket: CONFIGUIO_S3_UPLOAD, Key: filename};
    // console.log("getFileInfo: "+filename);

    s3.waitFor('objectExists', params, function(err, data) {
        if (err){
            callback(false);
        }else{
            // var url = s3BucketUpload.getSignedUrl('getObject', params);
            // console.log("Get URL is", url);
            callback(null, data);
        }
    });

    // var url = s3.getSignedUrl('getObject', params);
    // console.log("get URL is", url);
};

module.exports.deleteFile = function(filename, callback){
    var params = {Bucket: CONFIGUIO_S3_UPLOAD, Key: filename};

    s3.deleteObjects(params, function(err, data) {
        if (err){
            callback(false);
        }else{
            callback(null, data);
        }
    });

    // var url = s3.getSignedUrl('getObject', params);
    // console.log("get URL is", url);
};

module.exports.getURLBucket = function(callback){
    //var params = {Bucket: CONFIGUIO_S3_UPLOAD, Key: filename};
    var data = "https://configuio-upload-dev.s3.eu-west-1.amazonaws.com/";
    callback(null, data);
};