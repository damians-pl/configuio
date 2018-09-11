const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const multer = require('multer');

const project = require('./class_project');
const s3 = require('./s3');


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

app.get('/configuio/upload/project/getCoverImage/:uuId', function (req, res) {
    const uuId = req.params.uuId;

    const project_item = new project.Project();
    project_item.uuIdCurrent = uuId;
    project_item.loadProject(null, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }

        let db_item = project_item.getProject();
        if (db_item.fileCover == null) {
            return res.status(401).json({ error: 'No file uploaded' });
        }

        s3.getFileHead(db_item.fileCover, function (err, data) {
            const dataHeadFile = data;
            if(err && dataHeadFile.ContentLength > 0){
                return res.status(402).json({ error: 'Could not get file from disk' });

            }else{
                s3.getURLBucket(function (err, data) {
                    return res.json({
                        "uuId": project_item.uuIdCurrent,
                        "URL": data + db_item.fileCover,
                        "LastModified": dataHeadFile.LastModified
                    });
                })

            }
        });

    });


});

app.get('/configuio/upload/project/deleteCoverImage/:uuId', function (req, res) {
    const uuId = req.params.uuId;

    const project_item = new project.Project();
    project_item.uuIdCurrent = uuId;
    project_item.loadProject(null, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }

        let db_item = project_item.getProject();
        if (db_item.fileCover == null) {
            return res.status(401).json({ error: 'No file uploaded' });
        }

        s3.deleteFile(db_item.fileCover, function (err) {
            if(err){
                console.log(err);
                return res.status(402).json({ error: 'Could not finish operation' });
            }else{
                project_item.project = { "uuId": project_item.uuIdCurrent, "fileCover": null };

                project_item.updateCoverImageProject(null, function (err, data) {
                    if (err) {
                        console.log(err);
                        return res.status(403).json( {"error": err.message} ) ;
                    }
                    res.json(data);
                });

            }
        });

    });


});

// TEST
// app.get('/configuio/test', function (req, res) {
//     var html = '<!DOCTYPE html>\n' +
//         '<html lang="en">\n' +
//         '<head>\n' +
//         '  <meta charset="UTF-8">\n' +
//         '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
//         '  <meta http-equiv="X-UA-Compatible" content="ie=edge">\n' +
//         '  <title>S3 Demo</title>\n' +
//         '</head>\n' +
//         '<body>\n' +
//         '  <p>Upload file to S3</p>\n' +
//         '  <form action="/dev/configuio/project/uploadImage1/71f0a240-a620-11e8-b0d4-1bb54381c7f9" method="POST" enctype="multipart/form-data">\n' +
//         '    <fieldset>\n' +
//         '      <legend>Upload file</legend>\n' +
//         '      <input type="file" name="image">\n' +
//         '      <input type="submit">\n' +
//         '    </fieldset>\n' +
//         '  </form>\n' +
//         '</body>\n' +
//         '</html>';
//     res.send(html);
// })


module.exports.handler = serverless(app);