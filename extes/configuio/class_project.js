const express = require('express');
const _ = require('underscore');
// const uuid = require('uuid');
const db = require('./db');
// const s3 = require('./s3');

var Project = class Project {
    get uuIdCurrent() {
        return this._uuIdCurrent;
    }

    set uuIdCurrent(uuId) {
        if (typeof uuId !== 'string') {
            return new Error( '"uuId" must be a string' );
        }

        // if (uuid.isUUID(uuId) == false) {
        //     callback( new Error({ error: '"uuId" must be a valid' }) );
        // };

        this._uuIdCurrent = uuId;
    }

    get project() {
        return this._project;
    }

    set project(value) {
        if(typeof value !== 'object') return new Error({ error: '"uuId" must be a string' });
        this._project = _.extend(this._project, value);
    }

    constructor() {
        //Default schemat
        this.project_default = {
            "uuId": null,
            "createdAt": 0,
            "updatedAt": 0,
            "active": false,
            "projectName": null,
            "fileCover": null
        };
        this._project = this.project_default;

        this._uuIdCurrent = null;
    }

    load(arg, callback){
        let self = this;
        this.getProjectFromDB(this.uuIdCurrent, function(err, data){
            if(err){
                callback(err);
                return ;
            }

            self.project = data;

            callback(null, true);
        });

    }

    getProject(uuId){
        return this.project;
    }

    deleteProjectFromDB(arg, callback){


        const params = {
            TableName: db.values.CONFIGUIO_TABLE,
            Key: {
                uuId: this.uuIdCurrent,
            },
        };

        db.dynamoDb.delete(params, (error, result) => {
            if (error) callback( error );
            else {
                this._project = this.project_default;
                this._uuIdCurrent = null;

                callback(null, {"Success": true});
                return result.Item;
            }
        });
    };

    getProjectFromDB(arg, callback){

        const params = {
            TableName: db.values.CONFIGUIO_TABLE,
            Key: {
                uuId: this.uuIdCurrent,
            },
        };

        db.dynamoDb.get(params, (error, result) => {
            if (error) callback( error );
            else if (_.isObject(result.Item) === false) callback( new Error ("Project not found") );
            else {
                callback(null, result.Item);
                return result.Item;
            }
        });
    };

    getListProject(arg, callback){
        const params = {
            TableName: db.values.CONFIGUIO_TABLE,
        }

        db.dynamoDb.scan(params, (error, result) => {
            console.log(result);
            if (error) callback( error );
            else if (_.isObject(result.Items) === false) callback( new Error ("You don't have projects") );
            else {
                callback(null, result.Items);
                return result.Items;
            }

        });

    }


};

module.exports.Project = Project;
