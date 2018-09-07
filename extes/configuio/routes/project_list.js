var express = require('express');
var router = express.Router();
var db = require('../db');

// Get Project List endpoint
router.get('/', function (req, res) {
    const params = {
        TableName: db.values.CONFIGUIO_TABLE,
    }
    // res.json(params);

    db.dynamoDb.scan(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get list users' });
        }
        if (result.Items) {
            // const jsonResult = JSON.stringify(result.Items);
            res.json(result.Items);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
});

module.exports = router;
