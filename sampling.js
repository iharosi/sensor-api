#!/usr/local/bin/node

const BME280 = require('bme280-sensor');
const sensor = new BME280();
const mongoClient = require('mongodb').MongoClient;
const mongodbUrl = 'mongodb://localhost:27017/sensordb';
const collection = 'sensor';

mongoClient.connect(mongodbUrl, (error, database) => {
    if (error) {
        console.error(`Database error: ${error} `);
        process.exit(1);
    }

    sensor.init()
        .then(sensor.readSensorData.bind(sensor))
        .then((data) => {
            console.log(`data = ${JSON.stringify(data, null, 2)}`);
            // data
            // {
            //     "temperature_C" : 23.62,
            //     "humidity" : 41.8420938572956,
            //     "pressure_hPa" : 1001.175792812783,
            //     "timestamp" : 1516573041585,
            //     "_id" : ObjectId("5a651171842faa5d31ca41d4")
            // }
            database
                .collection(collection)
                .insertOne(Object.assign({}, data, {timestamp: Date.now()}));
            database.close();
        })
        .catch((error) => {
            console.error(`BME280 error: ${error} `);
            database.close();
        });
});
