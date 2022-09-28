const { runemetrics } = require('runescape-api');

module.exports = async (username) => {
    try {
        const profile = await runemetrics.getProfile(username);
        return profile.activities[0].date;
    } catch (err) { return undefined; }
}
