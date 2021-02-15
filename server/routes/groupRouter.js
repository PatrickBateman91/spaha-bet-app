const express = require('express');
const groupRouter = new express.Router();
const ObjectID = require('mongodb').ObjectID; 
const Group = require('../models/GroupModel');
const User = require('../models/UserModel');
const auth = require('../middleware/AuthUserCheck');  
const helpers = require('../helperFunctions/BasicFunctions');

groupRouter.post('/create-new-group', auth, async (req, res) => {
    if(req.headers.type === "upload group"){
        try{
            const group = new Group({
                activeBets: [],
                finishedBets:[],
                betsWaitingForAddApproval:[],
                betsWaitingForFinishedApproval:[],
                betsWaitingForEditApproval:[],
                people:[],
                invitedPeople:[],
                name:req.body.groupName,
                admin:req.user.nickname
            })
            group.people.push(req.user.nickname)
            group.invitedPeople.push(...req.body.invitedPeople);
            group.invitedPeople.push(...req.body.invitedOutsiders);
            
            req.user.groups.push(group._id.toString());

            await group.invitedPeople.forEach(async person => {
                User.find({nickname:person}, async(err, responseUser) => {
                    if(err){
                        return res.status(400).send("Could not add public user to the group!")
                    }
                    const newNotification = {
                        title: `${req.user.nickname} invited you to the group ${group.name}`,
                        data: {groupId:group._id},
                        seen:false,
                        timestamp: new Date(),
                        type: "pending group invite",
                        needsResolving:true,
                         _id: new ObjectID()
                    }
                   responseUser[0].notifications.push(newNotification);
                   await responseUser[0].save();
                })
            })
                await req.user.save()
                await group.save()
                res.send("Group added successfully!")
                   
        } catch(err){
           res.status(500).send("Could not add group to database!")
        }
    }

    else if(req.headers.type === "get users"){
        const regex = `^${req.body.nickname}` 
        const results = await User.find({nickname:  {$regex : regex, $options : "i"}})
        const nicknames = results.map(result => result.nickname);
        const newNicknames = nicknames.filter(name => name !== req.user.nickname);
        res.send(newNicknames);
    }
})

groupRouter.post('/join-new-group', auth, async (req, res) => {
    let id;
    try{
         id = new ObjectID(req.body.groupId);
         Group.findById(id, async (err, responseGroup) => {
            if(err){
                res.status(400).send("Could not find group with that ID!")
            }
            else if(responseGroup !== null){
                if(responseGroup.people.indexOf(req.user.nickname) !== -1){
                    res.send({
                        error:true,
                        errorMessage:"You are already part of this group!"
                    })
                } else{
                    User.find({nickname:responseGroup.admin}, async(err, responseUser) => {
                        const newNotification = {
                            title: `${req.user.nickname} wants to join your group ${responseGroup.name}`,
                            data: {user: req.user.nickname, groupId: responseGroup._id},
                            seen:false,
                            timestamp: new Date(),
                            type:"accept user to group",
                            needsResolving:true,
                            _id: new ObjectID()
                        }
                        responseUser[0].notifications.push(newNotification);
                        await responseUser[0].save();
                        res.send('Group inquiry has been sent to the group admin.')
                    })
                }
            }
            else{
                res.send({
                    error:true,
                    errorMessage:"Could not find group with that ID!!"
                })
            }
        })
    }
    catch(err){
        res.send({
            error:true,
            errorMessage:"Group ID is not valid!"
        })
    }
  
})

groupRouter.post('/manage-groups', auth, async (req, res) => {
    const id = new ObjectID(req.body.groupId);
    if(req.headers.type === "delete-group"){
        Group.findById(id, async (err, groupResponse) =>{
            if(err){
                return res.status(400).send('Could not find the group!')
            }
            if(req.user.nickname === groupResponse.admin){
                groupResponse.people.forEach(async person => {
                    if(person !== req.user.nickname){
                        User.find({nickname:person}, async (err, userResponse) => {
                            if(err){
                                res.status(400).send("Could not send user notifications!")
                            }
                            const newNotification = {
                                title: `${req.user.nickname} deleted the group ${groupResponse.name}`,
                                data: {},
                                seen:false,
                                timestamp: new Date(),
                                type: "group deleted",
                                needsResolving:false,
                                 _id: new ObjectID()
                            }
                            const newGroups = userResponse[0].groups.filter(group => group.toString() !== req.body.groupId.toString());
                            userResponse[0].groups = newGroups;
                            userResponse[0].notifications.push(newNotification);
                            userResponse[0].markModified('groups');
                            await userResponse[0].save();
                        })
                    }
                })
                const newUserGroups = req.user.groups.filter(group => group.toString() !== req.body.groupId.toString());
                req.user.groups = newUserGroups;
                req.user.markModified('groups');
                await req.user.save();
                await groupResponse.remove();
                res.send("Group deleted!")
            } else{
                return res.status(401).send("You can only delete groups you are admin off!")
            }
        })
    } else if(req.headers.type === "leave-group"){
        Group.findById(id, async (err, groupResponse) => {
            if(err){
                return res.status(400).send("Could not find user's group!");
            }
            if(req.user.nickname === groupResponse.admin){
                if(groupResponse.people.length === 1){
                    await groupResponse.remove();
                    const newGroups = req.user.groups.filter(group => group !== req.body.groupId);
                    req.user.groups = newGroups;
                    req.user.markModified('groups');
                    await req.user.save();
                    res.send('You left the group!');
                } else{
                    groupResponse.admin = groupResponse.people[1];
                }
            } else {
                const newPeople = groupResponse.people.filter(person => person !== req.user.nickname);
                groupResponse.people = newPeople;
                groupResponse.activeBets = helpers.deleteUserBets(groupResponse.activeBets, req.user.nickname);
                groupResponse.finishedBets = helpers.deleteUserBets(groupResponse.finishedBets, req.user.nickname);
                groupResponse.betsWaitingForAddApproval = helpers.deleteUserBets(groupResponse.betsWaitingForAddApproval, req.user.nickname);
                groupResponse.betsWaitingForEditApproval = helpers.deleteUserBets(groupResponse.betsWaitingForEditApproval, req.user.nickname);
                groupResponse.betsWaitingForFinishedApproval = helpers.deleteUserBets(groupResponse.betsWaitingForFinishedApproval, req.user.nickname);
                groupResponse.markModified('people');
                groupResponse.markModified('activeBets');
                groupResponse.markModified('finishedBets');
                groupResponse.markModified('betsWaitingForAddApproval');
                groupResponse.markModified('betsWaitingForEditApproval');
                groupResponse.markModified('betsWaitingForFinishedApproval');

                groupResponse.people.forEach(async person => {
                    User.find({nickname:person}, async (err, userResponse) => {
                        const newNotification = {
                            title: `${req.user.nickname} left the group ${groupResponse.name}`,
                            data: {},
                            seen:false,
                            timestamp: new Date(),
                            type: "user left the group",
                            needsResolving:false,
                             _id: new ObjectID()
                        }
                        userResponse[0].notifications.push(newNotification);
                        await userResponse[0].save();
                    })
                })
                const newGroups = req.user.groups.filter(group => group !== req.body.groupId);
                req.user.groups = newGroups;
                req.user.markModified('groups');
                await req.user.save();

                await groupResponse.save(function (err, doc) {
                    if (err) return req.status(400).send("Could not leave the group!");
                res.send('You left the group!')
                });
            }
        })
    } else if(req.headers.type === "edit-group-name"){
        Group.findById(id, async (err, groupResponse) => {
            if(err){
                return res.status(400).send('Could not find the group!')
            }
            if(req.user.nickname === groupResponse.admin){
                if(req.body.newGroupName === ""){
                    return res.status(400).send("Group name cannot be empty!")
                }
                console.log(req.body.newGroupName)
                const oldGroupName = groupResponse.name;
                groupResponse.people.forEach(person => {
                    if(person !== req.user.nickname){
                        User.find({nickname:person}, async (err, userResponse) => {
                            const newNotification = {
                                title: `${req.user.nickname} changed the group name from ${oldGroupName} to ${req.body.newGroupName}`,
                                data: {},
                                seen:false,
                                timestamp: new Date(),
                                type: "group name changed",
                                needsResolving:false,
                                 _id: new ObjectID()
                            }          
                            userResponse[0].notifications.push(newNotification);
                            await userResponse[0].save();
                        })
                    }
                })
                groupResponse.name = req.body.newGroupName;
                    await groupResponse.save()
                    res.send("Group name changed!")
            } else{
                res.status(401).send("You can change only names of the groups you are admin of!")
            }
        })
    } else if(req.headers.type === "invite-people"){
        const groupPromise = Group.findById(id).exec();
        groupPromise.then(async groupResponse =>{
            if(groupResponse.people.indexOf(req.user.nickname) !== -1){
                    req.body.invitedPeople.forEach(async (person, personIndex) => {
                       //Provjera da user već ne pripada grupi
                       if(groupResponse.people.indexOf(person) === -1 && groupResponse.invitedPeople.indexOf(person) === -1){
                           const userPromise = User.find({nickname:person}).exec();
                                 userPromise.then(async userResponse => {
                                    const newNotification = {
                                        title: `${req.user.nickname} invited you to the group ${groupResponse.name}`,
                                        data: {groupId:req.body.groupId},
                                        seen:false,
                                        timestamp: new Date(),
                                        type: "pending group invite",
                                        needsResolving:true,
                                         _id: new ObjectID()
                                    }
                                   userResponse[0].notifications.push(newNotification);
                                   groupResponse.invitedPeople.push(person);
                                   await userResponse[0].save();

                                   if(req.body.invitedPeople.length === personIndex + 1){
                                    await groupResponse.save();
                                    res.send("Users have been invited to the group!")
                                   }

                                 }).catch(err => {
                                    return res.status(400).send("Could not invite user to the group!")
                                 })
                       }
                   })
            } else{
                return res.status(401).send("You are not authorized to invite people to this group!")
            }
        }).catch(err => {
            return res.status(400).send("Could not find group!")
        })

    } else if(req.headers.type === "remove-people"){
        const groupPromise = Group.findById(id);
        groupPromise.then(groupResponse => {
            if(groupResponse.admin === req.user.nickname){
               req.body.peopleToRemove.forEach((person, index) => {
                   if(groupResponse.people.indexOf(person) !== -1){
                    const newPeople = groupResponse.people.filter(personToRemove => personToRemove !== person);
                    groupResponse.people = newPeople;
                    groupResponse.activeBets = helpers.deleteUserBets(groupResponse.activeBets, person);
                    groupResponse.finishedBets = helpers.deleteUserBets(groupResponse.finishedBets, person);
                    groupResponse.betsWaitingForAddApproval = helpers.deleteUserBets(groupResponse.betsWaitingForAddApproval, person);
                    groupResponse.betsWaitingForEditApproval = helpers.deleteUserBets(groupResponse.betsWaitingForEditApproval, person);
                    groupResponse.betsWaitingForFinishedApproval = helpers.deleteUserBets(groupResponse.betsWaitingForFinishedApproval, person);
                    const userPromise = User.find({nickname:person})
                    userPromise.then(async userResponse => {
                        const newGroups = userResponse[0].groups.filter(group => group.toString() !== req.body.groupId.toString());
                        
                        userResponse[0].groups = newGroups;

                        const newNotification = {
                            title: `${req.user.nickname} removed you from the gorup ${groupResponse.name}`,
                            data: {},
                            seen:false,
                            timestamp: new Date(),
                            type:"accept user to group",
                            needsResolving:false,
                            _id: new ObjectID()
                        }

                        userResponse[0].markModified('groups');
                        userResponse[0].notifications.push(newNotification);
                      
                        await userResponse[0].save();
                        console.log(req.body.peopleToRemove.length, index +1)
                        if(req.body.peopleToRemove.length === index + 1){
                            groupResponse.markModified('people');
                            groupResponse.markModified('activeBets');
                            groupResponse.markModified('finishedBets');
                            groupResponse.markModified('betsWaitingForAddApproval');
                            groupResponse.markModified('betsWaitingForEditApproval');
                            groupResponse.markModified('betsWaitingForFinishedApproval');
                            await groupResponse.save();
                            res.send("Users removed succesfully!")
                            }

                    }).catch(err => {
                        res.status(400).send("User not found!")
                    })

                } else{
                       res.status(400).send("Could not find user to remove!")
                   }
               })
            } else {
                res.status(401).send("You are not authorized to remove people from this group!")
            }
        }).catch(err => {
            res.status(400).send("Can't find group!")
        })
    } else if(req.headers.type === "get users"){
        const regex = `^${req.body.searchField}` 
        const results = await User.find({nickname:  {$regex : regex, $options : "i"}})
        const nicknames = results.map(result => result.nickname);
        const newNicknames = nicknames.filter(name => name !== req.user.nickname);
        res.send(newNicknames);
    }
})
module.exports = groupRouter;