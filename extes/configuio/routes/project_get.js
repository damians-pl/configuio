const express = require('express');
const router = express.Router();
const project = require('../class_project');

// Get Project List endpoint
router.get('/:uuId', function (req, res) {
    var item = new project.Project();
    item.load(req.params.uuId, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( err.message ) ;
        }

        res.json(data);
    });

});

module.exports = router;
