const EventEmitter = require('events');
const Stats = require('../models/StatsModel');
const ObjectID = require('mongodb').ObjectID;

const updateLatestBetsEmitter = new EventEmitter;

updateLatestBetsEmitter.on('new bet', (bet) => {
    const id = new ObjectID(process.env.STATS_ID);
    Stats.findById(id, async (err, statsResponse) => {
        statsResponse.latestBets.shift();
        statsResponse.latestBets.push(bet);
        statsResponse.save();
    })
})

module.exports = updateLatestBetsEmitter;