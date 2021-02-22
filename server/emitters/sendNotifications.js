const EventEmitter = require('events');
const User = require('../models/UserModel');
const ObjectID = require('mongodb').ObjectID;

const notificationEmitter = new EventEmitter;

notificationEmitter.on('send notifications', (userNickname, people, payload, deleteGroup, deleteGroupID) => {
    people.forEach(user => {
        User.find({ nickname: user }, async (err, userResponse) => {
            if (userResponse && userResponse.length > 0) {
                if (userResponse[0].nickname !== userNickname) {
                    const newNotification = {
                        title: `${payload.notificationText}`,
                        data: payload.data,
                        seen: payload.seen,
                        timestamp: new Date(),
                        type: payload.type,
                        needsResolving: payload.needsResolving,
                        _id: new ObjectID()
                    }

                    if (deleteGroup) {
                        const newGroups = userResponse[0].groups.filter(group => group.toString() !== deleteGroupID.toString());
                        userResponse[0].markModified('groups');
                        userResponse[0].groups = newGroups;
                    }
                    userResponse[0].markModified('notifications');
                    userResponse[0].notifications.push(newNotification);
                    userResponse[0].save();
                }
            }
        })
    })
})

module.exports = notificationEmitter;