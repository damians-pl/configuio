var express = require('express');
var router = express.Router();
const project = require('../class_project');

router.post('/', function (req, res) {
    const data = req.body;
    const project_item = new project.Project();

    if (typeof data.projectName !== 'string') {
        res.status(400).json({ error: '"projectName" must be a string' });
        return;
    }
    project_item.project = { "projectName":data.projectName }

    project_item.putProject(null, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }
        res.json(data);
    });
});

module.exports = router;
