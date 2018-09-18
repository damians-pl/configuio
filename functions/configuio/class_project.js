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
        if(typeof value !== 'object') return new Error("Error in seter project");
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


    async loadProject(arg, callback){
        let self = this;

        if(this.uuIdCurrent == null) throw new Error("No selected uuid project");

        let result = await this.getProjectFromDB(this.uuIdCurrent);
        self.project = result;
        return true;
    }

    async putProject(arg, callback){

        if ( this.uuIdCurrent !== null ) throw new Error("Allready selected uuid project");
        if ( this.project.uuId !== null ) throw new Error("Allready loaded project in stock");

        const uuId = uuid.v1();
        this.nowTimeCreate();
        this.nowTimeUpdate();
        this.project = {"uuId": uuId};

        const params = {
            TableName: db.values.CONFIGUIO_TABLE,
            Item: this.project,
        };


        let result = await db.dynamoDb.put(params).promise();

        this.uuIdCurrent = uuId;
        return uuId;
    }

    async updateProject(arg, callback){
        if ( this.uuIdCurrent === null ) throw new Error("No selected uuid project");
        if ( this.project.uuId === null ) throw new Error("No loaded project in stock");
        if( this.uuIdCurrent !==  this.project.uuId ) throw new Error("uuId's no =");

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

        let result = await db.dynamoDb.update(params).promise();
        return this.uuIdCurrent;
    }

    async updateCoverImageProject(arg, callback){
        if ( this.uuIdCurrent === null ) throw new Error("No selected uuid project");

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

        let result = await db.dynamoDb.update(params).promise();

        return this.uuIdCurrent;
    }


    async deleteProjectFromDB(arg, callback){
        if(this.uuIdCurrent == null) throw new Error("No selected uuid project");

        const params = {
            TableName: db.values.CONFIGUIO_TABLE,
            Key: {
                uuId: this.uuIdCurrent,
            },
        };

        let result = await db.dynamoDb.delete(params).promise();
        this._project = this.project_default;
        this._uuIdCurrent = null;

        return true;
    };

    async getProjectFromDB(arg, callback){
        if(this.uuIdCurrent == null) throw new Error("No selected uuid project");

        const params = {
            TableName: db.values.CONFIGUIO_TABLE,
            Key: {
                uuId: this.uuIdCurrent,
            },
        };

        let result = await db.dynamoDb.get(params).promise();

        if (_.isObject(result.Item) === false) throw new Error ("Project not found");
        return result.Item;

    };

    async getListProject(arg, callback){
        const params = {
            TableName: db.values.CONFIGUIO_TABLE,
        };

        let result = await db.dynamoDb.scan(params).promise();

        if (_.isObject(result.Items) === false) throw new Error ("You don't have projects");
        return result.Items;
    }


};

module.exports.Project = Project;
