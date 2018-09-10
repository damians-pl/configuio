var express = require('express');
var router = express.Router();
var db = require('../db');
var s3 = require('../s3');


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
            return res.status(400).json({ error: 'Could not get project' });
        }
        if (result.Item) {
            const db_item = result.Item;
            if (db_item.fileCover == null) {
                return res.status(401).json({ error: 'Could not get file from DB' });
            }

            s3.getFileHead(db_item.fileCover, function (err, data) {
                const dataHeadFile = data;
                if(err && dataHeadFile.ContentLength > 0){
                    return res.status(402).json({ error: 'Could not get file from disk' });

                }else{
                    s3.getURLBucket(function (err, data) {
                        return res.json({
                            "uuId": req.params.uuId,
                            "URL": data + db_item.fileCover,
                            "LastModified": dataHeadFile.LastModified
                        });
                    })

                }
            });


        } else {
            res.status(404).json({ error: "Project not found" });
        }
    });

});

module.exports = router;