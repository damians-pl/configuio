const express = require('express');
const router = express.Router();
const project = require('../class_project');


router.post('/:uuId', function (req, res) {
    const data_post = req.body;
    const project_item = new project.Project();
    project_item.uuIdCurrent = req.params.uuId;

    project_item.loadProject(null, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }

        if (typeof data_post.projectName !== 'string') {
            res.status(400).json({ "error": '"projectName" must be a string' });
            return;
        }

        project_item.project = { "projectName":data_post.projectName };

        project_item.updateProject(null, function (err, data) {
            if (err) {
                console.log(err);
                return res.status(400).json( {"error": err.message} ) ;
            }
            res.json(data);
        });
    });
});

module.exports = router;
