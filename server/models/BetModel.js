const mongoose = require('mongoose');

const jointBetSchema = new mongoose.Schema({
    bet:{
        type:String
    },
    participants:{
        type:Array,
        required:true
    },
    side:{
        type:String,
        required:true
    },
    value:{
        type:String,
        required:true
    }
})

const participantsSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    value:{
        type:String
    },
    singleStake:{
        type:String
    }
})

const betSchema = new mongoose.Schema({
    additionalClauses:{
        type:Array,
        default: []
    },
    amount:{
        type:Number,
        required: this.type === "money" ? true : false
    },
    approvedAddArray:{
        type:Array,
        required:true
    },
    approvedEditArray:{
        type:Array,
        required:true
    },
    approvedFinishArray:{
        type:Array,
        required:true
    },
    differentStakes:{
        type:Boolean,
        required:true
    },
    finished:{
        type:Boolean,
        default:false
    },
    limitedDuration:{
        type:Boolean,
        default:false
    },
    limitedDurationValue:{
        type:String,
        default:""
    },
    originalBet:{
        type:Array
    },
    participants:{
        type:Array,
        required:true
    },
    subject:{
        type:String,
        unique:true,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    stake:{
        type:String,
        required: this.type === "other" ? true : false
    },
    jointBet:{
        type:Boolean,
        default:false
    },
    winner:{

    },
    createdBy:{

    }

})

const Bet = mongoose.model('Bet', betSchema)

module.exports = Bet;