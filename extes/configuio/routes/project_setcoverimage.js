var express = require('express');
var router = express.Router();
var s3 = require('../s3');
var db = require('../db');
var multer = require('multer');
// var fs = require('fs');

function getExt(filename){
    return filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
}

function uploadToS3(file, destFileName, mimetype, callback) {
    // var uploadImage2 = multer({limits: {fileSize:10*1024*1024}}).array();
    s3.s3BucketUpload
        .upload({
            ACL: 'public-read',
            Body: file.buffer,
            Key: destFileName.toString(),
            // ContentType: 'application/octet-stream'
            ContentType: mimetype
        })
        // .on('httpUploadProgress', function(evt) { console.log(evt); })
        .send(callback);
}


var uploadImage1 = multer({limits: {fileSize:10*1024*1024}}).single("image");


router.post('/:uuId', uploadImage1, function (req, res) {
    const timestamp = new Date().getTime();
    const uuId = req.params.uuId;

    var fileNameUpload = req.file;
    var dirBucketSave = "uploads/configuio/"+uuId+"/project/";
    var fileNameBucketSave = "coverImage."+getExt(fileNameUpload.originalname);
    // var pid = '10000' + parseInt(Math.random() * 10000000);

    console.log(req.file);

    if (!fileNameUpload) {
        return res.status(400).json({ error: 'expect 1 file upload named "image"'});
    }

    if (!/^image\/(jpe?g|png)$/i.test(fileNameUpload.mimetype)) {
        return res.status(400).json({ error: 'expect image file'});
    }

    const fileUploadAll = dirBucketSave + fileNameBucketSave;

    uploadToS3(fileNameUpload, fileUploadAll, fileNameUpload.mimetype, function (err, data) {
        if (err) {
            console.error(err);
            return res.status(403).json({ error: 'failed to upload' + err});
        }

        const params = {
            TableName: db.values.CONFIGUIO_TABLE,
            Key: {
                uuId: uuId,
            },
            ExpressionAttributeValues: {
                ':fileCover': fileUploadAll.toString(),
                ':updatedAt': timestamp,
            },
            UpdateExpression: 'SET fileCover = :fileCover, updatedAt = :updatedAt',
            ReturnValues: 'ALL_NEW',
        };

        db.dynamoDb.update(params, (error) => {
            if (error) {
                console.log(error);
                res.status(400).json({ error: 'Could not update project' });
            }

            res.status(200).json({ uuId: req.params.uuId, url: data.Location});
        });

    })






});

module.exports = router;
