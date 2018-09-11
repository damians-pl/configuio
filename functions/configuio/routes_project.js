const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const multer = require('multer');

const project = require('./class_project');



app.use(bodyParser.json({ strict: false }));

app.get('/configuio/project/list/', function (req, res) {
    const project_item = new project.Project();
    project_item.uuIdCurrent = req.params.uuId;
    project_item.getListProject(null, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }

        res.json(data);
    });
});

app.get('/configuio/project/get/:uuId', function (req, res) {
    const project_item = new project.Project();
    project_item.uuIdCurrent = req.params.uuId;
    project_item.loadProject(null, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }

        res.json(project_item.getProject());
    });
});

app.post('/configuio/project/create/', function (req, res) {
    const data = req.body;
    const project_item = new project.Project();

    if (typeof data.projectName !== 'string') {
        res.status(400).json({ error: '"projectName" must be a string' });
        return;
    }
    project_item.project = { "projectName":data.projectName };

    project_item.putProject(null, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }
        res.json(data);
    });
});

app.get('/configuio/project/delete/:uuId', function (req, res) {
    const project_item = new project.Project();
    project_item.uuIdCurrent = req.params.uuId;
    project_item.deleteProjectFromDB(req.params.uuId, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }
        res.json(data);
    });

});

app.post('/configuio/project/update/:uuId', function (req, res) {
    const data_post = req.body;
    const project_item = new project.Project();
    project_item.uuIdCurrent = req.params.uuId;

    project_item.loadProject(null, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }

        if (typeof data_post.projectName !== 'string') {
            res.status(400).json({ "error": '"projectName" must be a string' });
            return;
        }

        project_item.project = { "projectName":data_post.projectName };

        project_item.updateProject(null, function (err, data) {
            if (err) {
                console.log(err);
                return res.status(400).json( {"error": err.message} ) ;
            }
            res.json(data);
        });
    });
});

app.get('/configuio/project/setActive/:uuId', function (req, res) {
    const project_item = new project.Project();
    project_item.uuIdCurrent = req.params.uuId;

    project_item.loadProject(null, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }

        project_item.project = { "active": true };

        project_item.updateProject(null, function (err, data) {
            if (err) {
                console.log(err);
                return res.status(400).json( {"error": err.message} ) ;
            }

            res.json(data);
        });
    });
});

app.get('/configuio/project/setDeactive/:uuId', function (req, res) {
    const project_item = new project.Project();
    project_item.uuIdCurrent = req.params.uuId;

    project_item.loadProject(null, function (err, data) {
        if (err) {
            console.log(err);
            return res.status(400).json( {"error": err.message} ) ;
        }

        project_item.project = { "active": false };

        project_item.updateProject(null, function (err, data) {
            if (err) {
                console.log(err);
                return res.status(400).json( {"error": err.message} ) ;
            }

            res.json(data);
        });
    });
});

// TEST
// app.get('/configuio/test', function (req, res) {
//     var html = '<!DOCTYPE html>\n' +
//         '<html lang="en">\n' +
//         '<head>\n' +
//         '  <meta charset="UTF-8">\n' +
//         '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
//         '  <meta http-equiv="X-UA-Compatible" content="ie=edge">\n' +
//         '  <title>S3 Demo</title>\n' +
//         '</head>\n' +
//         '<body>\n' +
//         '  <p>Upload file to S3</p>\n' +
//         '  <form action="/dev/configuio/project/uploadImage1/71f0a240-a620-11e8-b0d4-1bb54381c7f9" method="POST" enctype="multipart/form-data">\n' +
//         '    <fieldset>\n' +
//         '      <legend>Upload file</legend>\n' +
//         '      <input type="file" name="image">\n' +
//         '      <input type="submit">\n' +
//         '    </fieldset>\n' +
//         '  </form>\n' +
//         '</body>\n' +
//         '</html>';
//     res.send(html);
// })


module.exports.handler = serverless(app);