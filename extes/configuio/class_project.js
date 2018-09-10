const express = require('express');
const _ = require('underscore');
// const uuid = require('uuid');
const db = require('./db');
// const s3 = require('./s3');

var Project = class Project {
    get uuIdCurrent() {
        return this._uuIdCurrent;
    }

    set uuIdCurrent(value) {
        this._uuIdCurrent = value;
    }

    get project() {
        return this._project;
    }

    set project(value) {
        if(typeof value !== 'object') return new Error({ error: '"uuId" must be a string' });
        console.log(this._project);
        this._project = _.extend(this._project, value);
        console.log(this._project);
    }

    constructor() {
        //Default schemat
        this._project = {
            "uuId": null,
            "createdAt": 0,
            "updatedAt": 0,
            "active": false,
            "projectName": null,
            "fileCover": null
        };

        this._uuIdCurrent = null;
    }

    load(uuId, callback){
        let self = this;
        this.getProjectFromDB(uuId, function(err, data){
            if(err){
                callback(err);
                return ;
            }

            self.uuIdCurrent = uuId;
            self.project = data;

            console.log("Project");
            console.log(self.project);
            callback(null, true);
        });

    }

    getProjectFromDB(uuId, callback){
        if (typeof uuId !== 'string') {
            callback( new Error( '"uuId" must be a string' ) );
            return;
        }

        // if (uuid.isUUID(uuId) == false) {
        //     callback( new Error({ error: '"uuId" must be a valid' }) );
        // };

        const params = {
            TableName: db.values.CONFIGUIO_TABLE,
            Key: {
                uuId: uuId,
            },
        };

        db.dynamoDb.get(params, (error, result) => {
            if (error) callback( error );
            else if (_.isObject(result.Item) === false) callback( new Error ("Project not found") );
            else callback( null, result.Item );

        });
    }


};

module.exports.Project = Project;
