const express = require('express');
const _ = require('underscore');
const uuid = require('uuid');
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

    getProject(uuId){
        return this.project;
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

    nowTimeUpdate(){
        const timestamp = new Date().getTime();
        this.project = {"updatedAt": timestamp};
    }

    nowTimeCreate(){
        const timestamp = new Date().getTime();
        this.project = {"createdAt": timestamp};
    }


    loadProject(arg, callback){
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

    putProject(arg, callback){

        if( this.uuIdCurrent === null && this.project.uuId === null){
            // Nowy dodajemy
            const uuId = uuid.v1();

            this.nowTimeCreate();
            this.nowTimeUpdate();
            this.project = {"uuId": uuId};

            const params = {
                TableName: db.values.CONFIGUIO_TABLE,
                Item: this.project,
            };

            db.dynamoDb.put(params, (error) => {
                if (error) callback( error );
                else {
                    this.uuIdCurrent = uuId;
                    callback(null, uuId);
                    return uuId;
                }
            });

        }else{
            callback( new Error("Can't create project") );
        }

    }

    updateProject(arg, callback){

        if( this.uuIdCurrent ==  this.project.uuId ){
            // Update
            this.nowTimeUpdate();

            const params = {
                TableName: db.values.CONFIGUIO_TABLE,
                Key: {
                    uuId: this.uuIdCurrent,
                },
                ExpressionAttributeValues: {
                    ':projectName': this.project.projectName,
                    ':active': this.project.active || false,
                    ':updatedAt': this.project.updatedAt
                },
                UpdateExpression: 'SET projectName = :projectName, active = :active, updatedAt = :updatedAt',
                ReturnValues: 'ALL_NEW',
            };

            db.dynamoDb.update(params, (error) => {
                if (error) callback( error );
                else {
                    callback(null, this.uuIdCurrent);
                    return this.uuIdCurrent;
                }

            });
        }else{
            callback( new Error("Can't update project") );
        }

    }

    updateCoverImageProject(arg, callback){

        if( this.uuIdCurrent !==  null ){
            // Update
            this.nowTimeUpdate();

            const params = {
                TableName: db.values.CONFIGUIO_TABLE,
                Key: {
                    uuId: this.uuIdCurrent,
                },
                ExpressionAttributeValues: {
                    ':fileCover': this.project.fileCover,
                    ':updatedAt': this.project.updatedAt
                },
                UpdateExpression: 'SET fileCover = :fileCover, updatedAt = :updatedAt',
                ReturnValues: 'ALL_NEW',
            };

            db.dynamoDb.update(params, (error) => {
                if (error) callback( error );
                else {
                    callback(null, this.uuIdCurrent);
                    return this.uuIdCurrent;
                }

            });
        }else{
            callback( new Error("Can't update") );
        }

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
        };

        db.dynamoDb.scan(params, (error, result) => {
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
