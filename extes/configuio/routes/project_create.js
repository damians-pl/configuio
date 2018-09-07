var express = require('express');
const uuid = require('uuid');
var router = express.Router();
var db = require('../db');

// Get Project List endpoint
router.post('/', function (req, res) {
    const timestamp = new Date().getTime();
    const data = req.body;
    const uuId = uuid.v1();

    console.log("Pokaz data:");
    console.log(data);

    if (typeof data.projectName !== 'string') {
        res.status(400).json({ error: '"projectName" must be a string' });
    }

    const params = {
        TableName: db.values.CONFIGUIO_TABLE,
        Item: {
            uuId: uuId,
            projectName: data.projectName,
            active: false,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    };

    db.dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not create project' });
        }
        res.json({ uuId: uuId});
    });

});

module.exports = router;
