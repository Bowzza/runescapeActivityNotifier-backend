const webPush = require('web-push');
const dataSchema = require('./model/DataSchema');
require('dotenv').config();

const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;

webPush.setVapidDetails('mailto:example@yourdomain.com', publicKey, privateKey);

module.exports = async (newTimestamp, username) => {
    const payload = {
        notification: {
            data: {
                onActionClick: {
                    default: { operation: 'openWindow', url: 'https://apps.runescape.com/runemetrics/app/overview/player/'+username }
                },
            },
            icon: './favicon.ico',
            body: 'New activities at '+newTimestamp,
            title: username,
            vibrate: [100, 50, 100]
        }
    };
    const dataFromDB = await dataSchema.findOne({ username });
    dataFromDB.timestamp = newTimestamp;
    dataFromDB.subscription.forEach((sub, index) => {
        webPush.sendNotification(sub, JSON.stringify(payload)).then(async res => {
            console.log(res);
            await dataFromDB.save();
        }).catch(async err => {
            console.log(err);
            if(err.body === 'push subscription has unsubscribed or expired.\n') {
                dataFromDB.subscription.splice(index, 1);
                try {
                    await dataFromDB.save();
                } catch(err) { console.log(err); }
            }
        });
    });

}