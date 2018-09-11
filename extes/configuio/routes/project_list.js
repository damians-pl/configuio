var express = require('express');
var router = express.Router();
const project = require('../class_project');

router.get('/', function (req, res) {
    var project_item = new project.Project();
    project_item.uuIdCurrent = req.params.uuId;
    project_item.getListProject(null, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }

        res.json(data);
    });
});

module.exports = router;
