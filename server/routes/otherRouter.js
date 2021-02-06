const express = require('express');
const otherRouter = new express.Router();
const ObjectID = require('mongodb').ObjectID; 
const User = require('../models/UserModel');
const Group = require('../models/GroupModel');
const auth = require('../middleware/AuthUserCheck');  

otherRouter.post('/notifications', auth, async(req, res) => {

    if(req.headers.type === "read notifications"){

        req.user.notifications.forEach(notification => {
            if(!notification.needsResolving){
                notification.seen = true;
            }
        })
        try{
          
            req.user.markModified("notifications");
            await req.user.save();
            res.send('Notifications were updated successfully!')
        }catch(err){
            res.status(500).send("There was an error updating notifications!")
        }
    }

    else if(req.headers.type === "accept group invite"){
        const id = new ObjectID(req.body.groupId);
        try{
            Group.findById(id, async (err, responseGroup) => {
                if(err || responseGroup === null){
                    req.user.notifications.forEach(async notification => {
                       if(notification._id.toString() === req.body.notificationId.toString()){
                          notification.title = "The group is no longer available!"
                          notification.data = {};
                          notification.needsResolving = false;
                          notification.type = "Non-existing group invite"
                          req.user.markModified("notifications");
                          await req.user.save();
                          res.send('Notifications were updated successfully!')
                        }
                    })
                }
                else if(responseGroup.invitedPeople.indexOf(req.user.nickname) !== -1){
                    if(req.user.groups.indexOf(req.body.groupId.toString()) === -1){
                      if(req.body.answer === "Accept"){
                        await responseGroup.people.forEach(async person =>{
                           await User.find({nickname:person}, async (err, responseUser) => {
                            if(err){
                                res.status(400).send("Could't not find User to send notification too!")
                           }
                            const newNotification ={
                                title: `${req.user.nickname} joined your group ${responseGroup.name}`,
                                data: {},
                                seen:false,
                                timestamp: new Date(),
                                type:"accepted group invite",
                                needsResolving:false,
                                _id: new ObjectID()
                            }
                            responseUser[0].notifications.push(newNotification);
                            await responseUser[0].save();
                           })
                        })
                        
                       req.user.groups.push(req.body.groupId.toString())
                       const newNotifications = req.user.notifications.filter(notification => notification._id.toString() !== req.body.notificationId.toString());
                       req.user.notifications = newNotifications;
                       responseGroup.people.push(req.user.nickname);
                       const newInvited = responseGroup.invitedPeople.filter(newUser => newUser !== req.user.nickname);
                       responseGroup.invitedPeople = newInvited;
                       await responseGroup.save();
                       await req.user.save();
                       res.send("You were successfully joined the group!")
                      }
                      
                      else if(req.body.answer === "Decline"){
                        User.find({nickname:responseGroup.admin}, async (err, responseUser) => {
                            if(err){
                                return res.status(400).send("Could not send admin notification!");
                            }
                            const newNotification ={
                                title: `${req.user.nickname} declined your group invite!`,
                                data: {},
                                seen:false,
                                timestamp: new Date(),
                                type:"declined group invite",
                                needsResolving:false,
                                _id: new ObjectID()
                            }
                            responseUser[0].notifications.push(newNotification);
                            const newNotifications = req.user.notifications.filter(notification => notification._id.toString() !== req.body.notificationId.toString());
                            req.user.notifications = newNotifications;
                            const newInvited = responseGroup.invitedPeople.filter(newUser => newUser !== req.user.nickname);
                            responseGroup.invitedPeople = newInvited;
                            await responseGroup.save();
                            await responseUser[0].save();
                            await req.user.save();
                            res.send("You declined the group inquiry!")
                        })
                      }
                    }
                }
                else{
                    res.status(400).send("You aren't invited to this group!")
                }
            })
        } catch(err){
            res.status(400).send('You cannot join the group at the moment!')
        }
    }

    else if(req.headers.type === "accept user to group"){
        const id = new ObjectID(req.body.groupId)
        Group.findById(id, async(err, responseGroup) => {
            if(err){
                res.status(400).send("We couldn't find the group!")
            }
          
            if(responseGroup.admin === req.user.nickname){
                if(req.body.answer === "Accept"){
                    if(responseGroup.people.indexOf(req.body.userToJoin) === -1 ){
                        await responseGroup.people.forEach(async person => {
                            User.find({nickname: person}, async (err, userResponse) => {
                                if(err){
                                    res.status(400).send("Could not find user to send notification to!")
                                }
                                if(userResponse[0].nickname !== responseGroup.admin){
                                    const newNotification ={
                                        title: `${req.body.userToJoin} joined your group ${responseGroup.name}`,
                                        data: {},
                                        seen:false,
                                        timestamp: new Date(),
                                        type:"accepted group invite",
                                        needsResolving:false,
                                        _id:new ObjectID()
                                    }
                                    userResponse[0].notifications.push(newNotification);
                                    await userResponse[0].save();
                                }
                            })
                        })
                        responseGroup.people.push(req.body.userToJoin);
                     
                        await User.find({nickname:req.body.userToJoin}, async (err, userToJoinResponse) => {
                            if(err || userToJoinResponse.length !== 1){
                                responseGroup.people.pop();
                                const newNotification ={
                                    title: `User ${req.body.userToJoin} is no longer available!`,
                                    data: {},
                                    seen:false,
                                    timestamp: new Date(),
                                    type:"non-existing user",
                                    needsResolving:false,
                                    _id:new ObjectID()
                                }
                                req.user.notifications.push(newNotification);
                            } else{
                                userToJoinResponse[0].groups.push(req.body.groupId.toString());
                                const newNotification ={
                                    title: `You joined the ${responseGroup.name} group!`,
                                    data: {},
                                    seen:false,
                                    timestamp: new Date(),
                                    type:"accepted group invite",
                                    needsResolving:false,
                                    _id:new ObjectID()
                                }
                      
                                userToJoinResponse[0].notifications.push(newNotification);
                                await userToJoinResponse[0].save();
                            }
                        })
                      
                        const newNotifications = req.user.notifications.filter(notification => {
                            return notification._id.toString() !== req.body.notificationId.toString();
                        })
                        req.user.notifications = newNotifications;
                        req.user.markModified("notifications");
                        await responseGroup.save();
                        await req.user.save();
                        res.send("You accepted user to the group!")
                    }
                    
                }
                else if(req.body.answer === "Decline"){
                    User.find({nickname: req.body.userToJoin}, async (err, userToJoinResponse) => {
                        if(err || userToJoinResponse.length !== 1){
                            responseGroup.people.pop();
                            const newNotification ={
                                title: `User ${req.body.userToJoin} is no longer available!`,
                                data: {},
                                seen:false,
                                timestamp: new Date(),
                                type:"non-existing user",
                                needsResolving:false,
                                _id:new ObjectID()
                            }
                            req.user.notifications.push(newNotification);
                        } 
                        else {
                            const newNotification ={
                                title: `${responseGroup.admin} declined your group inquiry`,
                                data: {},
                                seen:false,
                                timestamp: new Date(),
                                type:"declined group inquiry",
                                needsResolving:false,
                                _id: new ObjectID()
                            }
                           
                            userToJoinResponse[0].notifications.push(newNotification);
                            await userToJoinResponse[0].save();
                        }
                        const newNotifications = req.user.notifications.filter(notification => notification._id.toString() !== req.body.notificationId.toString())
                        req.user.notifications = newNotifications;
                        req.user.markModified("notifications");
                        await req.user.save();
                        await res.send('Group inquiry declined!')
                    })
                }
                
            }
  
        })
    }

})

module.exports = otherRouter;