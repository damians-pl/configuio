var express = require('express');
var router = express.Router();
var s3 = require('../s3');
var multer = require('multer');
var fs = require('fs');


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

    var dirBucketSave = "/uploads/configuio/"+uuId+"/project/";
    var fileNameBucketSave = "coverImage.png";
    var fileNameUpload = req.file;
    // var pid = '10000' + parseInt(Math.random() * 10000000);

    // console.log(req.file);

    if (!fileNameUpload) {
        return res.status(400).json({ error: 'expect 1 file upload named "image"'});
    }

    // if (!/^image\/(jpe?g|png)$/i.test(fileNameUpload.mimetype)) {
    //     return res.status(400).json({ error: 'expect image file'});
    // }

    uploadToS3(fileNameUpload, dirBucketSave+fileNameBucketSave, fileNameUpload.mimetype, function (err, data) {
        if (err) {
            console.error(err);
            return res.status(403).json({ error: 'failed to upload' + err});
        }

        res.status(200).json({ uuId: req.params.uuId, url: data.Location});
    })



});

module.exports = router;
