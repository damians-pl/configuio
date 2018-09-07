var express = require('express');
var router = express.Router();
var db = require('../db');

// Get Project List endpoint
router.get('/:uuId', function (req, res) {
    const timestamp = new Date().getTime();
    const params = {
        TableName: db.values.CONFIGUIO_TABLE,
        Key: {
            uuId: req.params.uuId,
        },
        ExpressionAttributeValues: {
            ':active': false,
            ':updatedAt': timestamp,
        },
        UpdateExpression: 'SET active = :active, updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    };

    db.dynamoDb.update(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not update project' });
        }
        res.json({uuId: req.params.uuId});
    });


});

module.exports = router;
