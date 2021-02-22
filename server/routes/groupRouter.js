const express = require('express');
const auth = require('../middleware/AuthUserCheck');
const createCustomError = require('../helperFunctions/createCustomError');
const createSendObject = require('../helperFunctions/createSendObjects');
const groupRouter = new express.Router();
const notificationEmitter = require('../emitters/sendNotifications');
const ObjectID = require('mongodb').ObjectID;
const Group = require('../models/GroupModel');
const User = require('../models/UserModel');

const helpers = require('../helperFunctions/BasicFunctions');

groupRouter.post('/create-new-group', auth, async (req, res) => {
    if (req.headers.type === "upload group") {
        try {
            const group = new Group({
                activeBets: [],
                finishedBets: [],
                betsWaitingForAddApproval: [],
                betsWaitingForFinishedApproval: [],
                betsWaitingForEditApproval: [],
                people: [],
                invitedPeople: [],
                name: req.body.groupName,
                admin: req.user.nickname
            })

            if (req.body.groupName.length > 24) {
                const customError = createCustomError(400, "Group name has to be shorter", []);
                res.status(400).send(customError);
            }

            else {
                group.people.push(req.user.nickname)
                group.invitedPeople.push(...req.body.invitedPeople);
                group.invitedPeople.push(...req.body.invitedOutsiders);

                req.user.groups.push(group._id.toString());
                const notificationText = `${req.user.nickname} invited you to the group ${group.name}`;

                notificationEmitter.emit('send notifications', req.user.nickname, group.invitedPeople, { data: { groupId: group._id }, needsResolving: true, notificationText, seen: false, type: "pending group invite" }, false, null);
                await req.user.save()
                await group.save();
                const sendObject = createSendObject(201, "Group added successfully!", group)
                res.status(203).send(sendObject);
            }
        }

        catch (err) {
            const customError = createCustomError(500, "Could not add group to the database!", err);
            res.status(500).send(customError)
        }
    }

    else if (req.headers.type === "get users") {
        const regex = `^${req.body.nickname}`
        const results = await User.find({ nickname: { $regex: regex, $options: "i" } })
        const nicknames = results.map(result => result.nickname);
        const newNicknames = nicknames.filter(name => name !== req.user.nickname);
        const sendObject = createSendObject(200, "Suggestions sent!", newNicknames)
        res.status(200).send(sendObject);
    }
})

groupRouter.post('/join-new-group', auth, async (req, res) => {
    let id;

    try {
        id = new ObjectID(req.body.groupId);
        Group.findById(id, async (err, responseGroup) => {
            if (err) {
                const customError = createCustomError(404, "Could not find group with that ID!", err)
                res.status(404).send(customError)
            }
            else if (responseGroup !== null) {
                if (responseGroup.people.indexOf(req.user.nickname) !== -1) {
                    const customError = createCustomError(400, "You are already part of this group!", [])
                    res.status(400).send(customError);
                }

                else {
                    User.find({ nickname: responseGroup.admin }, async (err, responseUser) => {
                        if (err || !responseUser) {
                            const customError = createCustomError(404, "Can't find user!", [])
                            res.status(404).send(customError);
                        }
                        const duplicateCheck = helpers.joinGroupDuplicateCheck(responseUser[0].notifications, req.user.nickname, id);
                        if (duplicateCheck) {
                            const customError = createCustomError(400, "You already asked to join this group!", [])
                            res.status(400).send(customError);
                        }

                        else {
                            const notificationText = `${req.user.nickname} wants to join your group ${responseGroup.name}`;
                            notificationEmitter.emit('send notifications', req.user.nickname, [responseUser[0].nickname], { data: { user: req.user.nickname, groupId: responseGroup._id }, needsResolving: true, notificationText, seen: false, type: "accept user to group" }, false, null);
                            const sendObject = createSendObject(200, 'Group inquiry has been sent to the group admin!', []);
                            res.status(200).send(sendObject)
                        }
                    })
                }
            }

            else {
                const customError = createCustomError(404, "Could not find group with that ID!!", []);
                res.status(404).send(customError);
            }
        })
    }

    catch (err) {
        const customError = createCustomError(400, "Group ID is not valid!", err);
        res.status(400).send(customError);
    }
})

groupRouter.post('/manage-groups', auth, async (req, res) => {
    const id = new ObjectID(req.body.groupId);
    if (req.headers.type === "delete-group") {
        Group.findById(id, async (err, groupResponse) => {
            if (err || !groupResponse) {
                const customError = createCustomError(404, "Could not find the group!", [])
                return res.status(400).send(customError)
            }

            if (req.user.nickname === groupResponse.admin) {
                const notificationText = `${req.user.nickname} deleted the group ${groupResponse.name}`;
                notificationEmitter.emit('send notifications', req.user.nickname, groupResponse.people, { data: {}, needsResolving: false, notificationText, seen: false, type: "group deleted" }, true, groupResponse._id);

                const newUserGroups = req.user.groups.filter(group => group.toString() !== req.body.groupId.toString());
                req.user.groups = newUserGroups;
                req.user.markModified('groups');
                await req.user.save();
                await groupResponse.remove();
                const sendObject = createSendObject(200, "Group deleted!", id)
                res.status(200).send(sendObject)
            }

            else {
                const customError = createCustomError(403, "You can only delete groups you are admin off!", [])
                return res.status(403).send(customError)
            }
        })
    }

    else if (req.headers.type === "leave-group") {
        Group.findById(id, async (err, groupResponse) => {
            if (err || !groupResponse) {
                const customError = createCustomError(404, "Could not find user's group!", [])
                return res.status(404).send(customError);
            }

            let adminSwitch = false;
            let groupDeleted = false;

            if (req.user.nickname === groupResponse.admin) {
                if (groupResponse.people.length === 1) {
                    groupDeleted = true;
                    const newGroups = req.user.groups.filter(group => group !== req.body.groupId);
                    req.user.groups = newGroups;
                    req.user.markModified('groups');
                    await groupResponse.remove();
                    await req.user.save();
                    const sendObject = createSendObject(200, 'You left the group!', req.body.groupId)
                    res.status(201).send(sendObject);
                }
                //Prebacivanje admina na drugu osobu
                else {
                    groupResponse.admin = groupResponse.people[1];
                    adminSwitch = true;
                }
            }

            if (!groupDeleted) {
                const newPeople = groupResponse.people.filter(person => person !== req.user.nickname);
                groupResponse.people = newPeople;
                groupResponse.activeBets = helpers.deleteUserBets(groupResponse.activeBets, req.user.nickname);
                groupResponse.finishedBets = helpers.deleteUserBets(groupResponse.finishedBets, req.user.nickname);
                groupResponse.betsWaitingForAddApproval = helpers.deleteUserBets(groupResponse.betsWaitingForAddApproval, req.user.nickname);
                groupResponse.betsWaitingForEditApproval = helpers.deleteUserBets(groupResponse.betsWaitingForEditApproval, req.user.nickname);
                groupResponse.betsWaitingForFinishedApproval = helpers.deleteUserBets(groupResponse.betsWaitingForFinishedApproval, req.user.nickname);

                if (adminSwitch) {
                    groupResponse.markModified('admin');
                }

                groupResponse.markModified('people');
                groupResponse.markModified('activeBets');
                groupResponse.markModified('finishedBets');
                groupResponse.markModified('betsWaitingForAddApproval');
                groupResponse.markModified('betsWaitingForEditApproval');
                groupResponse.markModified('betsWaitingForFinishedApproval');

                const notificationText = `${req.user.nickname} left the group ${groupResponse.name}`;
                notificationEmitter.emit('send notifications', req.user.nickname, groupResponse.people, { data: {}, needsResolving: false, notificationText, seen: false, type: "user left the group" }, false, null);

                const newGroups = req.user.groups.filter(group => group.toString() !== req.body.groupId.toString());
                req.user.groups = newGroups;
                req.user.markModified('groups');
                try {
                    await groupResponse.save();
                    await req.user.save();
                    const sendObject = createSendObject(200, "You left the group!", req.body.groupId);
                    res.status(200).send(sendObject);
                }

                catch (err) {
                    const customError = createCustomError(500, "Could not leave group at the moment!", err);
                    res.status(500).send(customError);
                }
            }
        })
    }

    else if (req.headers.type === "edit-group-name") {
        Group.findById(id, async (err, groupResponse) => {
            if (err || !groupResponse) {
                ž
                const customError = createCustomError(404, 'Could not find the group!', []);
                return res.status(404).send(customError);
            }
            if (req.user.nickname === groupResponse.admin) {
                if (req.body.newGroupName === "") {
                    const customError = createCustomError(400, "Group name cannot be empty!", []);
                    return res.status(400).send(customError);
                }

                const notificationText = `${req.user.nickname} changed the group name from ${groupResponse.name} to ${req.body.newGroupName}`;
                notificationEmitter.emit('send notifications', req.user.nickname, [groupResponse.people], { data: {}, needsResolving: false, notificationText, seen: false, type: "group name changed" }, false, null);

                groupResponse.name = req.body.newGroupName;
                try {
                    await groupResponse.save()
                    const sendObject = createSendObject(200, "Group name changed!", groupResponse);
                    res.status(200).send(sendObject);
                }

                catch (err) {
                    const customError = createCustomError(400, err.message || "Could not edit name!", err);
                    res.status(400).send(customError);
                }
            }

            else {
                const customError = createCustomError(401, "You can change only names of the groups you are admin of!", [])
                res.status(401).send(customError)
            }
        })
    }

    else if (req.headers.type === "invite-people") {
        const groupPromise = Group.findById(id).exec();
        groupPromise.then(async groupResponse => {
            if (groupResponse.people.indexOf(req.user.nickname) !== -1) {
                const nonMembers = [];
                req.body.invitedPeople.forEach(async (person, personIndex) => {
                    //Provjera da user već ne pripada grupi
                    if (groupResponse.people.indexOf(person) === -1 && groupResponse.invitedPeople.indexOf(person) === -1) {
                        groupResponse.invitedPeople.push(person);
                        nonMembers.push(person);
                    }
                })

                if (nonMembers.length === 0) {
                    const message = req.body.invitedPeople.length > 1 ? "Everyone" : "This person";
                    const customError = createCustomError(400, `${message} has already been invited or is a part of the group already!`, []);
                    res.status(400).send(customError);
                }

                else {
                    const notificationText = `${req.user.nickname} invited you to the group ${groupResponse.name}`
                    notificationEmitter.emit('send notifications', req.user.nickname, nonMembers, { data: { groupId: req.body.groupId }, needsResolving: true, notificationText, seen: false, type: "pending group invite" }, false, null);
                    await groupResponse.save();
                    const sendObject = createSendObject(200, '', []);
                    res.status(200).send(sendObject);
                }
            } else {
                const customError = createCustomError(401, "You are not authorized to invite people to this group!", [])
                return res.status(401).send(customError)
            }
        }).catch(err => {
            const customError = createCustomError(500, "Could not invite people", err)
            return res.status(500).send(customError)
        })

    }

    else if (req.headers.type === "remove-people") {
        const groupPromise = Group.findById(id);
        groupPromise.then(async groupResponse => {
            let newPeople = [];
            if (groupResponse.admin === req.user.nickname) {
                req.body.peopleToRemove.forEach((person, index) => {
                    if (groupResponse.people.indexOf(person) !== -1) {
                        newPeople = groupResponse.people.filter(personToRemove => personToRemove !== person);
                        groupResponse.people = newPeople;
                        groupResponse.activeBets = helpers.deleteUserBets(groupResponse.activeBets, person);
                        groupResponse.finishedBets = helpers.deleteUserBets(groupResponse.finishedBets, person);
                        groupResponse.betsWaitingForAddApproval = helpers.deleteUserBets(groupResponse.betsWaitingForAddApproval, person);
                        groupResponse.betsWaitingForEditApproval = helpers.deleteUserBets(groupResponse.betsWaitingForEditApproval, person);
                        groupResponse.betsWaitingForFinishedApproval = helpers.deleteUserBets(groupResponse.betsWaitingForFinishedApproval, person);
                    }
                })

                const notificationText = `${req.user.nickname} removed you from the group ${groupResponse.name}`;
                await notificationEmitter.emit('send notifications', req.user.nickname, req.body.peopleToRemove, { data: {}, needsResolving: false, notificationText, seen: false, type: "removed from group" }, true, id);

                groupResponse.markModified('people');
                groupResponse.markModified('activeBets');
                groupResponse.markModified('finishedBets');
                groupResponse.markModified('betsWaitingForAddApproval');
                groupResponse.markModified('betsWaitingForEditApproval');
                groupResponse.markModified('betsWaitingForFinishedApproval');
                await groupResponse.save();
                const sendObject = createSendObject(200, "Removed successfully!", groupResponse);
                res.status(200).send(sendObject);
            }

            else {
                const customError = createCustomError(401, "You are not authorized to remove people from this group!", err);
                res.status(401).send(customError);
            }

        }).catch(err => {
            const customError = createCustomError(400, "Can't add people at the moment!", err);
            res.status(400).send(customError)
        })
    }

    else if (req.headers.type === "get users") {
        const regex = `^${req.body.searchField}`
        const results = await User.find({ nickname: { $regex: regex, $options: "i" } })
        const nicknames = results.map(result => result.nickname);
        const newNicknames = nicknames.filter(name => name !== req.user.nickname);
        const sendObject = createSendObject(200, "Suggestions sent!", newNicknames);
        res.status(200).send(sendObject);
    }
})

module.exports = groupRouter;