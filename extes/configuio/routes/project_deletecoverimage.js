const express = require('express');
const router = express.Router();
const project = require('../class_project');
const s3 = require('../s3');


router.get('/:uuId', function (req, res) {
    const uuId = req.params.uuId;

    const project_item = new project.Project();
    project_item.uuIdCurrent = req.params.uuId;
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

module.exports = router;