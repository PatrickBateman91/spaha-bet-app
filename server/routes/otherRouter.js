const express = require('express');
const auth = require('../middleware/AuthUserCheck');
const createCustomError = require('../helperFunctions/createCustomError');
const createSendObject = require('../helperFunctions/createSendObjects');
const otherRouter = new express.Router();
const notificationEmitter = require('../emitters/sendNotifications');
const ObjectID = require('mongodb').ObjectID;
const User = require('../models/UserModel');
const Group = require('../models/GroupModel');

otherRouter.post('/notifications', auth, async (req, res) => {
    if (req.headers.type === "read notifications") {
        req.user.notifications.forEach(notification => {
            if (!notification.needsResolving) {
                notification.seen = true;
            }
        })

        try {
            req.user.markModified("notifications");
            await req.user.save();
            const sendObject = createSendObject(200, 'Notifications were updated successfully!', []);
            res.status(200).send(sendObject);
        }

        catch (err) {
            const customError = createCustomError(500, "There was an error updating notifications!", err)
            res.status(500).send(customError);
        }
    }

    else if (req.headers.type === "accept group invite") {
        const id = new ObjectID(req.body.groupId.toString());

        try {
            Group.findById(id, async (err, groupResponse) => {
                if (err || !groupResponse) {
                    const filteredNotifications = req.user.notifications.filter(notification => notification._id.toString() !== req.body.notificationId.toString());
                    req.user.notifications = filteredNotifications;
                    req.user.markModified("notifications");
                    await req.user.save();
                    const customError = createCustomError(404, 'Group is no longer available!', []);
                    res.status(400).send(customError);
                }

                else if (groupResponse.invitedPeople.indexOf(req.user.nickname) !== -1) {
                    if (req.user.groups.indexOf(req.body.groupId.toString()) === -1) {
                        if (req.body.answer === "Accept") {

                            //Poslati svim korisnicima notifikaciju da se neko joinao grupi
                            const notificationText = `${req.user.nickname} joined your group ${groupResponse.name}`;
                            notificationEmitter.emit('send notifications', req.user.nickname, groupResponse.people, { data: {}, needsResolving: false, notificationText, seen: false, type: "accepted group invite" }, false, null);

                            req.user.groups.push(req.body.groupId.toString())
                            const newNotifications = req.user.notifications.filter(notification => notification._id.toString() !== req.body.notificationId.toString());
                            req.user.notifications = newNotifications;
                            groupResponse.people.push(req.user.nickname);
                            const newInvited = groupResponse.invitedPeople.filter(newUser => newUser !== req.user.nickname);
                            groupResponse.invitedPeople = newInvited;
                            req.user.markModified('notifications');
                            await groupResponse.save();
                            await req.user.save();
                            const sendObject = createSendObject(200, "You were successfully joined the group!", groupResponse)
                            res.status(200).send(sendObject);
                        }

                        else if (req.body.answer === "Decline") {
                            const notificationText = `${req.user.nickname} declined your group invite!`;
                            notificationEmitter.emit('send notifications', req.user.nickname, [groupResponse.admin], { data: {}, needsResolving: false, notificationText, seen: false, type: "declined group invite" }, false, null);
                            const newNotifications = req.user.notifications.filter(notification => notification._id.toString() !== req.body.notificationId.toString());
                            req.user.notifications = newNotifications;
                            const newInvited = groupResponse.invitedPeople.filter(newUser => newUser !== req.user.nickname);
                            groupResponse.invitedPeople = newInvited;
                            req.user.markModified('notifications');
                            await groupResponse.save();
                            await req.user.save();
                            const sendObject = createSendObject(200, "You declined the group inquiry!", []);
                            res.status(200).send(sendObject);
                        }
                    }
                }

                else {
                    const customError = createCustomError(400, "You aren't invited to this gorup!", []);
                    res.status(400).send(customError);
                }
            })
        }

        catch (err) {
            const customError = createCustomError(500, 'Could not join the group at the moment!', err)
            res.status(500).send(customError);
        }
    }

    else if (req.headers.type === "accept user to group") {
        const id = new ObjectID(req.body.groupId)
        Group.findById(id, async (err, groupResponse) => {
            if (err || !groupResponse) {
                const customError = createCustomError(404, "Could not find the group!", []);
                res.status(404).send(customError);
            }

            await User.find({ nickname: req.body.userToJoin }, async (err, userToJoinResponse) => {
                if (err || userToJoinResponse.length === 0) {
                    let newNotifications = req.user.notifications.filter(notification => notification._id.toString() !== req.body.notificationId.toString());
                    req.user.notifications = newNotifications;
                    req.user.markModified('notifications');
                    await req.user.save();
                    const customError = createCustomError(404, "User is no longer registered!", []);
                    res.status(404).send(customError)
                }

                else {
                    if (groupResponse.admin === req.user.nickname) {
                        if (req.body.answer === "Accept") {
                            if (groupResponse.people.indexOf(req.body.userToJoin) === -1) {
                                groupResponse.people.push(req.body.userToJoin);
                                const newNotifications = req.user.notifications.filter(notification => notification._id.toString() !== req.body.notificationId.toString());
                                req.user.notifications = newNotifications;
                                req.user.markModified('notifications');
                                userToJoinResponse[0].groups.push(groupResponse._id.toString());
                                await groupResponse.save();
                                await userToJoinResponse[0].save();
                                await req.user.save();

                                {
                                    const notificationText = `${req.body.userToJoin} joined your ${groupResponse.name} group!`;
                                    notificationEmitter.emit('send notifications', req.body.userToJoin, groupResponse.people, { data: {}, needsResolving: false, notificationText, seen: false, type: "accepted group invite" }, false, null);
                                }
                                {
                                    const notificationText = `You joined the ${groupResponse.name} group!`;
                                    notificationEmitter.emit('send notifications', req.user.nickname, [req.body.userToJoin], { data: {}, needsResolving: false, notificationText, seen: false, type: "accepted group invite" }, false, null);
                                }

                                const sendObject = createSendObject(200, "You accepted user to the group!", groupResponse)
                                res.status(200).send(sendObject);
                            }
                        }
                        else if (req.body.answer === "Decline") {
                            const notificationText = `${req.user.nickname} declined your request to join ${groupResponse.name}!`;
                            notificationEmitter.emit('send notifications', req.user.nickname, [req.body.userToJoin], { data: {}, needsResolving: false, notificationText, seen: false, type: "declined group invite" }, false, null);
                            const newNotifications = req.user.notifications.filter(notification => notification._id.toString() !== req.body.notificationId.toString())
                            req.user.notifications = newNotifications;
                            req.user.markModified("notifications");
                            await req.user.save();
                            const sendObject = createSendObject(200, "Group request declined!", groupResponse);
                            await res.status(200).send(sendObject);
                        }
                    }
                }
            })
        })
    }
})

module.exports = otherRouter;