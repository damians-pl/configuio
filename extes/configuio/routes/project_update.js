var express = require('express');
var router = express.Router();
var db = require('../db');

// Get Project List endpoint
router.post('/:uuId', function (req, res) {
    const timestamp = new Date().getTime();
    const data = req.body;

    if (typeof data.projectName !== 'string') {
        res.status(400).json({ error: '"projectName" must be a string' });
    }

    const params = {
        TableName: db.values.CONFIGUIO_TABLE,
        Key: {
            uuId: req.params.uuId,
        },
        ExpressionAttributeValues: {
            ':projectName': data.projectName,
            ':active': data.active || false,
            ':updatedAt': timestamp,
        },
        UpdateExpression: 'SET projectName = :projectName, active = :active, updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    };

    db.dynamoDb.update(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not update user' });
        }
        res.json({uuId: req.params.uuId});
    });
    
});

module.exports = router;
