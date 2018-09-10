const express = require('express');
const router = express.Router();
const db = require('../db');
const s3 = require('../s3');


router.get('/:uuId', function (req, res) {
    const uuId = req.params.uuId;
    const params = {
        TableName: db.values.CONFIGUIO_TABLE,
        Key: {
            uuId: uuId,
        },
    };

    db.dynamoDb.get(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get file' });
        }
        if (result.Item) {
            const db_item = result.Item;
            s3.deleteFile(db_item.fileCover, function (err) {
                // const dataHeadFile = data;
                if(err){
                    return res.status(400).json({ error: 'Could not finish operation' });
                }else{

                    const timestamp = new Date().getTime();
                    const params = {
                        TableName: db.values.CONFIGUIO_TABLE,
                        Key: {
                            uuId: uuId,
                        },
                        ExpressionAttributeValues: {
                            ':fileCover': null,
                            ':updatedAt': timestamp,
                        },
                        UpdateExpression: 'SET fileCover = :fileCover, updatedAt = :updatedAt',
                        ReturnValues: 'ALL_NEW',
                    };

                    db.dynamoDb.update(params, (error) => {
                        if (error) {
                            console.log(error);
                            return res.status(400).json({ error: 'Could not update project' });
                        }

                        return res.json({
                            "uuId": req.params.uuId
                        });
                    });


                }
            });

        } else {
            res.status(404).json({ error: "Project not found" });
        }
    });

});

module.exports = router;