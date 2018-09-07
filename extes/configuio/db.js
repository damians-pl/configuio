var express = require('express');
const AWS = require('aws-sdk');
const uuid = require('uuid');
var dynamoose = require('dynamoose');
let dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports = {};
module.exports.values = {
    'CONFIGUIO_TABLE': process.env.CONFIGUIO_TABLE,
    'IS_OFFLINE': process.env.IS_OFFLINE
};
module.exports.dynamoDb = dynamoDb;

module.exports.init = function(){

};