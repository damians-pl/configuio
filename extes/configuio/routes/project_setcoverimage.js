const express = require('express');
const router = express.Router();
const s3 = require('../s3');
const project = require('../class_project');
const multer = require('multer');

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
    const uuId = req.params.uuId;

    const fileNameUpload = req.file;
    const dirBucketSave = "uploads/configuio/"+uuId+"/project/";
    var fileNameBucketSave = "coverImage."+getExt(fileNameUpload.originalname);
    const fileUploadAll = dirBucketSave + fileNameBucketSave;
    // var pid = '10000' + parseInt(Math.random() * 10000000);

    // console.log(req.file);

    if (!fileNameUpload) {
        return res.status(400).json({ error: 'expect 1 file upload named "image"'});
    }

    if (!/^image\/(jpe?g|png)$/i.test(fileNameUpload.mimetype)) {
        return res.status(400).json({ error: 'expect image file'});
    }


    uploadToS3(fileNameUpload, fileUploadAll, fileNameUpload.mimetype, function (err, data) {
        if (err) {
            console.error(err);
            return res.status(401).json({ error: 'failed to upload' + err});
        }
        const data_uploaded = data;
        const project_item = new project.Project();
        project_item.uuIdCurrent = req.params.uuId;
        project_item.project = { "uuId": project_item.uuIdCurrent, "fileCover": fileUploadAll.toString() };
        project_item.updateCoverImageProject(null, function (err, data) {
            if (err) {
                console.log(err);
                return res.status(400).json( {"error": err.message} ) ;
            }
            res.status(200).json({ uuId: project_item.uuIdCurrent, url: data_uploaded.Location});
        });


    });

});

module.exports = router;
