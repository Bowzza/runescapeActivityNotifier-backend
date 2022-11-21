const express = require('express');
const cors = require('cors');
require('dotenv').config()
const cronjob = require('node-cron');
const mongoose = require('mongoose');
const dataSchema = require('./model/DataSchema');
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URL, () => {
    console.log('Connected to mongodb!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Server is listening on port '+port);
});

const subUsernameRoute = require('./routes/subAndUsernameRoute');
app.use('/', subUsernameRoute);

const getInfo = require('./rsapi');
const sendNotification = require('./PushNotification');

cronjob.schedule('*/2 * * * *', async () => {
    console.log('Check for activity');
    const dataFromDB = await dataSchema.find();
    if(dataFromDB.length === 0) return;
    let timestampUndefined = false;
    dataFromDB.forEach(async(data, index) => {
        const newTimestamp = await getInfo(data.username);
        if(newTimestamp === undefined) {
            timestampUndefined = true;
            dataFromDB.splice(index, 1);
            try {
                await dataFromDB.save();
            } catch(err) { console.log(err); }
        }
        if(!timestampUndefined && data.timestamp !== newTimestamp) {
            sendNotification(newTimestamp, data.username);
            console.log('sending...');
        }
        timestampUndefined = false;
    });
});