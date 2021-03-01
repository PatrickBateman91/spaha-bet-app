const mongoose = require('mongoose');

//Schema za pravljenje novih grupa
const statsSchema = new mongoose.Schema({
    latestBets: {
        type: Array,
        required: true
    },
    popularBets:{
        type:Object,
        required:true
    }
})

const Stats = mongoose.model('Stat', statsSchema);

module.exports = Stats;