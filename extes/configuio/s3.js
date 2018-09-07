var express = require('express');
const AWS = require('aws-sdk');

module.exports = {};
module.exports.values = {
    'CONFIGUIO_TABLE': process.env.CONFIGUIO_TABLE,
    'IS_OFFLINE': process.env.IS_OFFLINE
};