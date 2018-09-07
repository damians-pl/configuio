const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
var path = require('path');
const app = express();
const AWS = require('aws-sdk');

const uuid = require('uuid');
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


// Get Project by uuId endpoint
app.get('/configuio/project/get/:uuId', function (req, res) {
    const params = {
        TableName: CONFIGUIO_TABLE,
        Key: {
            uuId: req.params.uuId,
        },
    }

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get project' });
        }
        if (result.Item) {
            const db = result.Item;
            res.json(db);
        } else {
            res.status(404).json({ error: "Project not found" });
        }
    });
})

// Delete User endpoint
app.get('/configuio/project/delete/:uuId', function (req, res) {
    const params = {
        TableName: CONFIGUIO_TABLE,
        Key: {
            uuId: req.params.uuId,
        },
    }

    dynamoDb.delete(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not delete user' });
        }

        res.json({uuId: req.params.uuId});
    });
})

// Create Project endpoint
app.post('/configuio/project/create', function (req, res) {
    const timestamp = new Date().getTime();
    const data = req.body;
    const uuId = uuid.v1();

    console.log("Pokaz data:");
    console.log(data);

    if (typeof data.projectName !== 'string') {
        res.status(400).json({ error: '"projectName" must be a string' });
    }

    const params = {
        TableName: CONFIGUIO_TABLE,
        Item: {
            uuId: uuId,
            projectName: data.projectName,
            active: false,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not create project' });
        }
        res.json({ uuId: uuId});
    });
})

// Update Project endpoint
app.post('/configuio/project/update/:uuId', function (req, res) {

    const timestamp = new Date().getTime();
    const data = req.body;

    if (typeof data.projectName !== 'string') {
        res.status(400).json({ error: '"projectName" must be a string' });
    }

    const params = {
        TableName: CONFIGUIO_TABLE,
        Key: {
            uuId: req.params.uuId,
        },
        ExpressionAttributeValues: {
            ':projectName': data.projectName,
            ':active': data.active || false,
            ':updatedAt': timestamp,
        },
        UpdateExpression: 'SET projectName = :projectName, active = :active, updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    };

    dynamoDb.update(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not update user' });
        }
        res.json({uuId: req.params.uuId});
    });
})

// Active Project endpoint
app.get('/configuio/project/setActive/:uuId', function (req, res) {

    const timestamp = new Date().getTime();
    const data = req.body;

    const params = {
        TableName: CONFIGUIO_TABLE,
        Key: {
            uuId: req.params.uuId,
        },
        ExpressionAttributeValues: {
            ':active': true,
            ':updatedAt': timestamp,
        },
        UpdateExpression: 'SET active = :active, updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    };

    dynamoDb.update(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not update project' });
        }
        res.json({uuId: req.params.uuId});
    });
})

// DeActive Project endpoint
app.get('/configuio/project/setDeactive/:uuId', function (req, res) {

    const timestamp = new Date().getTime();
    const data = req.body;

    const params = {
        TableName: CONFIGUIO_TABLE,
        Key: {
            uuId: req.params.uuId,
        },
        ExpressionAttributeValues: {
            ':active': false,
            ':updatedAt': timestamp,
        },
        UpdateExpression: 'SET active = :active, updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    };

    dynamoDb.update(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not update project' });
        }
        res.json({uuId: req.params.uuId});
    });
})

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


// var uploadImage1 = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: 'configuio-upload-dev',
//         acl: 'public-read',
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         // metadata: function (req, file, cb) {
//         //     cb(null, {fieldName: file.fieldname});
//         // },
//         key: function (req, file, cb) {
//             cb(null, Date.now().toString())
//         }
//     })
// });


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


    //////////
    // upload(req, res, function (err) {
    //     if (err) {
    //         console.error(err);
    //         return res.status(500).send('failed to upload to s3').end();
    //     }
    //

    //
    // })


})



module.exports.handler = serverless(app);