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

    db.dynamoDb.delete(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not delete user' });
        }

        res.json({uuId: req.params.uuId});
    });

});

module.exports = router;
