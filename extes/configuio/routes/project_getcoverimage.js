const express = require('express');
const router = express.Router();
const s3 = require('../s3');
const project = require('../class_project');


router.get('/:uuId', function (req, res) {
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

module.exports = router;