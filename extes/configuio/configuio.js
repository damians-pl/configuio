const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');

const uuid = require('uuid');
var multer = require('multer')
var multerS3 = require('multer-s3')

const CONFIGUIO_S3_UPLOAD = process.env.CONFIGUIO_S3_UPLOAD;
const s3BucketUpload = new AWS.S3({params: {Bucket: CONFIGUIO_S3_UPLOAD}});

const CONFIGUIO_TABLE = process.env.CONFIGUIO_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();


app.use(bodyParser.json({ strict: false }));


// Get Project List endpoint
app.get('/configuio/project/list', function (req, res) {
    const params = {
        TableName: CONFIGUIO_TABLE,
    }

    dynamoDb.scan(params, (error, result) => {
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
})

// Get Project by uuId endpoint
app.get('/configuio/project/get/:uuId', function (req, res) {
    const params = {
        TableName: CONFIGUIO_TABLE,
        Key: {
            uuId: req.params.uuId,
        },
    }

    dynamoDb.get(params, (error, result) => {
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
})

// Delete User endpoint
app.get('/configuio/project/delete/:uuId', function (req, res) {
    const params = {
        TableName: CONFIGUIO_TABLE,
        Key: {
            uuId: req.params.uuId,
        },
    }

    dynamoDb.delete(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not delete user' });
        }

        res.json({uuId: req.params.uuId});
    });
})

// Create Project endpoint
app.post('/configuio/project/create', function (req, res) {
    const timestamp = new Date().getTime();
    const data = req.body;
    const uuId = uuid.v1();

    console.log("Pokaz data:");
    console.log(data);

    if (typeof data.projectName !== 'string') {
        res.status(400).json({ error: '"projectName" must be a string' });
    }

    const params = {
        TableName: CONFIGUIO_TABLE,
        Item: {
            uuId: uuId,
            projectName: data.projectName,
            active: false,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not create project' });
        }
        res.json({ uuId: uuId});
    });
})

// Update Project endpoint
app.post('/configuio/project/update/:uuId', function (req, res) {

    const timestamp = new Date().getTime();
    const data = req.body;

    if (typeof data.projectName !== 'string') {
        res.status(400).json({ error: '"projectName" must be a string' });
    }

    const params = {
        TableName: CONFIGUIO_TABLE,
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

    dynamoDb.update(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not update user' });
        }
        res.json({uuId: req.params.uuId});
    });
})

// Active Project endpoint
app.get('/configuio/project/setActive/:uuId', function (req, res) {

    const timestamp = new Date().getTime();
    const data = req.body;

    const params = {
        TableName: CONFIGUIO_TABLE,
        Key: {
            uuId: req.params.uuId,
        },
        ExpressionAttributeValues: {
            ':active': true,
            ':updatedAt': timestamp,
        },
        UpdateExpression: 'SET active = :active, updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    };

    dynamoDb.update(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not update project' });
        }
        res.json({uuId: req.params.uuId});
    });
})

// DeActive Project endpoint
app.get('/configuio/project/setDeactive/:uuId', function (req, res) {

    const timestamp = new Date().getTime();
    const data = req.body;

    const params = {
        TableName: CONFIGUIO_TABLE,
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

    dynamoDb.update(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not update project' });
        }
        res.json({uuId: req.params.uuId});
    });
})


var uploadImage1 = multer({
    storage: multerS3({
        s3: s3BucketUpload,
        bucket: CONFIGUIO_S3_UPLOAD,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
});

// Upload 1 Project endpoint
app.post('/configuio/project/uploadImage1/:uuId', uploadImage1.array('photos', 3), function (req, res) {
    const uuId = req.params.uuId;
    var fileName = "/uploads/"+uuId+"/";

    const timestamp = new Date().getTime();
    const data = req;


    var params = {
        Key: fileName,
        Body: data,
        XSD: req.files.length,
    };
    console.log(params);
    res.status(400).json({ error: 'Function stop' });

    // s3bucket.upload(params, function (err, res) {
    //     if(err)
    //         console.log("Error in uploading file on s3 due to "+ err)
    //     else
    //         console.log("File successfully uploaded.")
    // });

})



module.exports.handler = serverless(app);