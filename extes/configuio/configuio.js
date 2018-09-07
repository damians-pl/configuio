const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
var path = require('path');
const app = express();
const AWS = require('aws-sdk');

var multer = require('multer');
var fs = require('fs');
//var multerS3 = require('multer-s3');

const CONFIGUIO_S3_UPLOAD = process.env.CONFIGUIO_S3_UPLOAD;
const s3BucketUpload = new AWS.S3({params: {Bucket: CONFIGUIO_S3_UPLOAD}});

const IS_OFFLINE = process.env.IS_OFFLINE;
const CONFIGUIO_TABLE = process.env.CONFIGUIO_TABLE;
let dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict: false }));

var project_list = require(__dirname + '/routes/project_list');
app.use('/configuio/project/list', project_list);

var project_get = require(__dirname + '/routes/project_get');
app.use('/configuio/project/get', project_get);

var project_create = require(__dirname + '/routes/project_create');
app.use('/configuio/project/create', project_create);

var project_delete = require(__dirname + '/routes/project_delete');
app.use('/configuio/project/delete', project_delete);

var project_update = require(__dirname + '/routes/project_update');
app.use('/configuio/project/update', project_update);

var project_setactive = require(__dirname + '/routes/project_setactive');
app.use('/configuio/project/setActive', project_setactive);

var project_setdeactive = require(__dirname + '/routes/project_setdeactive');
app.use('/configuio/project/setDeactive', project_setdeactive);


// TEST
app.get('/configuio/test', function (req, res) {
    var html = '<!DOCTYPE html>\n' +
        '<html lang="en">\n' +
        '<head>\n' +
        '  <meta charset="UTF-8">\n' +
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
        '  <meta http-equiv="X-UA-Compatible" content="ie=edge">\n' +
        '  <title>S3 Demo</title>\n' +
        '</head>\n' +
        '<body>\n' +
        '  <p>Upload file to S3</p>\n' +
        '  <form action="/dev/configuio/project/uploadImage1/71f0a240-a620-11e8-b0d4-1bb54381c7f9" method="POST" enctype="multipart/form-data">\n' +
        '    <fieldset>\n' +
        '      <legend>Upload file</legend>\n' +
        '      <input type="file" name="image">\n' +
        '      <input type="submit">\n' +
        '    </fieldset>\n' +
        '  </form>\n' +
        '</body>\n' +
        '</html>';
    res.send(html);
})


function uploadToS3(file, destFileName, callback) {
    var uploadImage2 = multer({limits: {fileSize:10*1024*1024}}).array();
    s3BucketUpload
        .upload({
            ACL: 'public-read',
            Body: file.buffer,
            Key: destFileName.toString(),
            ContentType: 'application/octet-stream'
        })
        // .on('httpUploadProgress', function(evt) { console.log(evt); })
        .send(callback);
}


// Upload 1 Project endpoint
var uploadImage1 = multer({limits: {fileSize:10*1024*1024}}).single("image");
app.post('/configuio/project/uploadImage1/:uuId', uploadImage1, function (req, res) {
    const timestamp = new Date().getTime();
    const uuId = req.params.uuId;

    var dirBucketSave = "/uploads/configuio/"+uuId+"/project/";
    var fileNameBucketSave = "uploadImage1";
    var fileNameUpload = req.file;
    // var pid = '10000' + parseInt(Math.random() * 10000000);

    // console.log(req.file);

    if (!fileNameUpload) {
        return res.status(403).send('expect 1 file upload named "image"').end();
    }

    if (!/^image\/(jpe?g|png)$/i.test(fileNameUpload.mimetype)) {
        return res.status(403).send('expect image file').end();
    }

    uploadToS3(fileNameUpload, fileNameBucketSave, function (err, data) {
        if (err) {
            console.error(err);
            return res.status(500).send('failed to upload to s3' + err).end();
        }

        res.status(200)
            .send('File uploaded to S3: '
                + data.Location.replace(/</g, '&lt;')
                + '<br/><img src="' + data.Location.replace(/"/g, '&quot;') + '"/>')
            .end();
    })



})



module.exports.handler = serverless(app);