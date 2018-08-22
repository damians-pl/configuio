const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');


const CONFIGUIO_TABLE = process.env.CONFIGUIO_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();


app.use(bodyParser.json({ strict: false }));


// Get User endpoint
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

// Get User endpoint
app.get('/configuio/get/:userId', function (req, res) {
    const params = {
        TableName: CONFIGUIO_TABLE,
        Key: {
            userId: req.params.userId,
        },
    }

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get user' });
        }
        if (result.Item) {
            const {userId, userName} = result.Item;
            res.json({ userId, userName });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
})

// Delete User endpoint
app.get('/configuio/delete/:userId', function (req, res) {
    const params = {
        TableName: CONFIGUIO_TABLE,
        Key: {
            userId: req.params.userId,
        },
    }

    dynamoDb.delete(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not delete user' });
        }

        res.json();
    });
})

// Create User endpoint
app.post('/configuio/create', function (req, res) {
    const { userId, userName } = req.body;

    if (typeof userId !== 'string') {
        res.status(400).json({ error: '"userId" must be a string' });
    } else if (typeof userName !== 'string') {
        res.status(400).json({ error: '"name" must be a string' });
    }

    const params = {
        TableName: CONFIGUIO_TABLE,
        Item: {
            userId: userId,
            userName: userName,
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not create user' });
        }
        res.json({ userId, userName });
    });
})

// Update User endpoint
app.post('/configuio/update/:userId', function (req, res) {

    const timestamp = new Date().getTime();
    const data = JSON.parse(JSON.stringify(req.body));

    if (typeof data.userName !== 'string') {
        res.status(400).json({ error: '"name" must be a string' });
    }

    const params = {
        TableName: CONFIGUIO_TABLE,
        Key: {
            userId: req.params.userId,
        },
        ExpressionAttributeValues: {
            ':userName': data.userName,
            ':active': data.active || false,
            ':updatedAt': timestamp,
        },
        UpdateExpression: 'SET userName = :userName, active = :active, updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    };

    dynamoDb.update(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not update user' });
        }
        res.json();
    });
})


module.exports.handler = serverless(app);