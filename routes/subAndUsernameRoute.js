const dataSchema = require('../model/DataSchema');
const searchUser = require('../rsapi');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    res.send('Request received.');
});

router.get('/names', async (req, res) => {
    const allData = await dataSchema.find();
    if(!allData) return res.status(404).json({ message: 'No data were found.' });

    let names = [];
    allData.forEach(data => {
        names.push({
            username: data.username,
            timestamp: data.timestamp
        });
    });

    res.send(names);
});

router.post('/', async (req, res) => {
    const sub = req.body.sub;
    const username = req.body.username;
    if(!sub) return res.status(404).json({ message: 'No sub found.' });
    if(!username) return res.status(404).json({ message: 'No username found.' });

    const data = await dataSchema.findOne({ username });
    if(!data) {
        const timestamp = await searchUser(username);
        if(timestamp === undefined) return res.status(404).json({ message: 'User was not found or profile is set to private.' });
        const newData = new dataSchema({
            username,
            timestamp,
            subscription: []
        });
        newData.subscription.push(sub);
        try {
            await newData.save();
            return res.json({ message: 'User has been saved for notifying.' });
        } catch (err) {
            return res.status(500).json({ message: 'Something went wrong.' });
        }
    }
    data.subscription.push(sub);
    try {
        await data.save();
        res.json({ message: 'Sub has been saved!' });
    } catch(err) {
        return res.status(500).json({ message: 'Something went wrong.' });
    }
});

module.exports = router;