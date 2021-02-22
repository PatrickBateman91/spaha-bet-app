const mongoose = require('mongoose');
const validator = require('validator');

//Schema za pravljenje novih grupa
const groupSchema = new mongoose.Schema({
    activeBets: {
        type: Array,
        required: true
    },
    finishedBets: {
        type: Array,
        required: true
    },
    betsWaitingForAddApproval: {
        type: Array,
        required: true
    },
    betsWaitingForEditApproval: {
        type: Array,
        required: true
    },
    betsWaitingForFinishedApproval: {
        type: Array,
        required: true
    },
    people: {
        type: Array,
        required: true
    },
    invitedPeople: {
        type: Array,
        required: true
    },
    name: {
        type: String,
        required: true,
        validate(value) {
            if (value.length < 1) {
                throw new Error('Group name has to have at least 1 character')
            }

            else if (value.length > 25) {
                throw new Error('Group name has to be shorter!')
            }
        }
    },
    admin: {
        type: String,
        required: true
    }
})

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;