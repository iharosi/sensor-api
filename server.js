#!/usr/local/bin/node

const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;
const collection = 'sensor';
const path = require('path');
const app = express();
const handleError = (res, reason, message, code) => {
    console.log('ERROR: ' + reason);
    res.status(code || 500).json({
        error: message
    });
};
var db;

app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(morgan('dev')); /* 'default', 'short', 'tiny', 'dev' */
app.use(bodyParser.json());

mongodb.MongoClient.connect('mongodb://localhost:27017/sensordb', (err, database) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    db = database;
    console.log('Database connection ready');

    var server = app.listen(3000, () => {
        var port = server.address().port;
        console.log('App now running on port', port);
    });
});

app.get('/sensor', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    db.collection(collection).find().sort({
        _id: -1
    }).limit(144).toArray((error, items) => {
        if (error) {
            handleError(res, error.message, 'Failed to get data');
        } else {
            res.status(200).json(items);
        }
    });
});

app.get('/sensor/last', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    db.collection(collection).find().sort({
        _id: -1
    }).limit(1).toArray((error, item) => {
        if (error) {
            handleError(res, error.message, 'Failed to get data');
        } else {
            res.status(200).json(item[0]);
        }
    });
});

app.get('/sensor/id/:id', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    db.collection(collection).findOne({
        _id: new ObjectID(req.params.id)
    }, (error, item) => {
        if (error) {
            handleError(res, error.message, 'Failed to get data');
        } else {
            res.status(200).json(item);
        }
    });
});

