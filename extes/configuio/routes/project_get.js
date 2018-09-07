var express = require('express');
var router = express.Router();
var db = require('../db');

// Get Project List endpoint
router.get('/:uuId', function (req, res) {
    const params = {
        TableName: db.values.CONFIGUIO_TABLE,
        Key: {
            uuId: req.params.uuId,
        },
    }

    db.dynamoDb.get(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get project' });
        }
        if (result.Item) {
            const db = result.Item;
            res.json(db);
        } else {
            res.status(404).json({ error: "Project not found" });
        }
    });

});

module.exports = router;
