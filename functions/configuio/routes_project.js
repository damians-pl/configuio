const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
// const multer = require('multer');

const project = require('./class_project');

const asyncHandler = fn => (req, res, next) =>
    Promise
        .resolve(fn(req, res, next))
        .catch(next);

app.use(bodyParser.json({ strict: false }));

app.get('/configuio/project/list/', asyncHandler( async function (req, res) {

    try {
        const project_item = new project.Project();
        let data = await project_item.getListProject();
        res.json(data);
    }catch (e) {
        console.log(e);
        return res.status(400).json( {"error": e.message} ) ;
    }

    // project_item.getListProject(null, function (err, data) {
    //     if (err) {
    //         console.log(err);
    //         return res.status(400).json( {"error": err.message} ) ;
    //     }
    //
    //     res.writeHead(200, {
    //         'Content-Type': 'text/plain',
    //         'Access-Control-Allow-Origin': '*',
    //         'Access-Control-Allow-Credentials': true
    //     }).json(data);
    // });
}));

app.get('/configuio/project/get/:uuId', asyncHandler( async function (req, res) {

    try {
        const project_item = new project.Project();
        project_item.uuIdCurrent = req.params.uuId;

        await project_item.loadProject();
        const result = project_item.getProject();
        res.json(result);
    }catch (e) {
        console.log(e);
        return res.status(400).json( {"error": e.message} ) ;
    }

}));

app.post('/configuio/project/create/', asyncHandler( async function (req, res) {
    try {
        const data = req.body;
        const project_item = new project.Project();

        if (typeof data.projectName !== 'string') {
            res.status(400).json({ error: '"projectName" must be a string' });
            return;
        }
        project_item.project = { "projectName": data.projectName };


        const result = await project_item.putProject();
        res.json( {"success": true, "data": result} );
    }catch (e) {
        console.log(e);
        return res.status(400).json( {"error": e.message} ) ;
    }
}));

app.get('/configuio/project/delete/:uuId', asyncHandler( async function (req, res) {
    try {
        const project_item = new project.Project();
        project_item.uuIdCurrent = req.params.uuId;
        let result = await project_item.deleteProjectFromDB();
        res.json( {"success": true} );
    }catch (e) {
        console.log(e);
        return res.status(400).json( {"error": e.message} ) ;
    }
}));

app.post('/configuio/project/update/:uuId', asyncHandler( async function (req, res) {
    try {
        const data_post = req.body;
        if (typeof data_post.projectName !== 'string') {
            res.status(400).json({ "error": '"projectName" must be a string' });
            return;
        }

        const project_item = new project.Project();
        project_item.uuIdCurrent = req.params.uuId;

        await project_item.loadProject();
        project_item.project = { "projectName": data_post.projectName };

        await project_item.updateProject();

        const result = await project_item.getProject();
        res.json( {"success": true, "data": result} );
    }catch (e) {
        console.log(e);
        return res.status(400).json( {"error": e.message} ) ;
    }
}));

app.get('/configuio/project/setActive/:uuId', asyncHandler( async function (req, res) {
    try {
        const project_item = new project.Project();
        project_item.uuIdCurrent = req.params.uuId;

        await project_item.loadProject();
        project_item.project = { "active": true };

        await project_item.updateProject();

        res.json( {"success": true} );
    }catch (e) {
        console.log(e);
        return res.status(400).json( {"error": e.message} ) ;
    }

}));

app.get('/configuio/project/setDeactive/:uuId', asyncHandler( async function (req, res) {
    try {
        const project_item = new project.Project();
        project_item.uuIdCurrent = req.params.uuId;

        await project_item.loadProject();
        project_item.project = { "active": false };

        await project_item.updateProject();

        res.json( {"success": true} );
    }catch (e) {
        console.log(e);
        return res.status(400).json( {"error": e.message} ) ;
    }
}));

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