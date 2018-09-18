const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const multer = require('multer');

const project = require('./class_project');
const s3 = require('./s3');

const asyncHandler = fn => (req, res, next) =>
    Promise
        .resolve(fn(req, res, next))
        .catch(next);

app.use(bodyParser.json({ strict: false }));


app.post('/configuio/upload/project/setCoverImage/:uuId', multer({limits: {fileSize:10*1024*1024}}).single("image"), function (req, res) {
    const uuId = req.params.uuId;

    const fileNameUpload = req.file;
    const dirBucketSave = "uploads/configuio/"+uuId+"/project/";
    const fileNameBucketSave = "coverImage." + getExt(fileNameUpload.originalname);
    const fileUploadAll = dirBucketSave + fileNameBucketSave;
    // var pid = '10000' + parseInt(Math.random() * 10000000);

    // console.log(req.file);

    if (!fileNameUpload) {
        return res.status(400).json({ error: 'expect 1 file upload named "image"'});
    }

    if (!/^image\/(jpe?g|png)$/i.test(fileNameUpload.mimetype)) {
        return res.status(400).json({ error: 'expect image file'});
    }

    function getExt(filename){
        return filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
    }

    function uploadToS3(file, destFileName, mimetype, callback) {
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


    uploadToS3(fileNameUpload, fileUploadAll, fileNameUpload.mimetype, async function (err, data) {
        if (err) {
            console.error(err);
            return res.status(401).json({ error: 'failed to upload' + err});
        }

        try {
            const data_uploaded = data;
            const project_item = new project.Project();
            project_item.uuIdCurrent = req.params.uuId;
            project_item.project = { "fileCover": fileUploadAll.toString() };

            const result = await project_item.updateCoverImageProject();
            res.status(200).json({ uuId: project_item.uuIdCurrent, url: data_uploaded.Location});
        }catch (e) {
            console.log(e);
            return res.status(400).json( {"error": e.message} ) ;
        }
    });

});

app.get('/configuio/upload/project/getCoverImage/:uuId', asyncHandler( async function (req, res) {
    const uuId = req.params.uuId;

    try {
        const project_item = new project.Project();
        project_item.uuIdCurrent = uuId;

        await project_item.loadProject();
        if ( project_item.project.fileCover == null ) throw new Error("No file uploaded");

        const dataHeadFile = await s3.getFileHead(project_item.project.fileCover);
        if (!(dataHeadFile.ContentLength > 0)) throw new Error('Could not get file from disk');

        const dataURL = await s3.getURLBucket();

        return res.json({
            "uuId": uuId,
            "URL": dataURL + project_item.project.fileCover,
            "LastModified": dataHeadFile.LastModified
        });

    }catch (e) {
        console.log(e);
        return res.status(400).json( {"error": e.message} ) ;
    }

}));

app.get('/configuio/upload/project/deleteCoverImage/:uuId', asyncHandler( async function (req, res) {
    const uuId = req.params.uuId;

    try {
        const project_item = new project.Project();
        project_item.uuIdCurrent = uuId;

        await project_item.loadProject();
        if ( project_item.project.fileCover == null ) throw new Error("No file uploaded");

        const dataHeadFile = await s3.getFileHead(project_item.project.fileCover);
        if (!(dataHeadFile.ContentLength > 0)) throw new Error('Could not get file from disk');

        await s3.deleteFile(project_item.project.fileCover);

        project_item.project = { "fileCover": null };
        await project_item.updateCoverImageProject();

        res.json( {"success": true} );
    }catch (e) {
        console.log(e);
        return res.status(400).json( {"error": e.message} ) ;
    }

}));



module.exports.handler = serverless(app);