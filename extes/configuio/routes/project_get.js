const express = require('express');
const router = express.Router();
const project = require('../class_project');


router.get('/:uuId', function (req, res) {
    const project_item = new project.Project();
    project_item.uuIdCurrent = req.params.uuId;
    project_item.loadProject(null, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }

        res.json(project_item.getProject());
    });
});

module.exports = router;
