const express = require('express');
const auth = require('../middleware/AuthUserCheck');
const createCustomError = require('../helperFunctions/createCustomError');
const createSendObject = require('../helperFunctions/createSendObjects');
const User = require('../models/UserModel');
const Group = require('../models/GroupModel');
const Stats = require('../models/StatsModel');
const ObjectID = require('mongodb').ObjectID;
const bcryptjs = require('bcryptjs');
const helpers = require('../helperFunctions/BasicFunctions');
const nodemailer = require('nodemailer');
const notificationEmitter = require('../emitters/sendNotifications');
const upload = require('../helperFunctions/multerUpload');
const userRouter = new express.Router();

//Get Data
userRouter.get('/', auth, async (req, res) => {
    if (req.headers.type === "get user") {
        const id = new ObjectID(process.env.STATS_ID);
        Stats.findById(id, async (err, statsResponse) => {
          if(err){
            const sendObject = createSendObject(200, "User successfully received!", req.user);
            res.status(200).send(sendObject);
          }

          const sendObject = createSendObject(200, "User successfully received!", {user: req.user, latestBets: statsResponse.latestBets, popularBets: statsResponse.popularBets});
          res.status(200).send(sendObject);
        })
    }

    else if (req.headers.type === "get groups") {
        let sendData = [];
        let deletedGroupTrigger = false;
        let numberOfDeletedGroups = 0;
        let originalGroupsLength = req.user.groups.length;
        if (originalGroupsLength !== 0) {
            req.user.groups.forEach(async group => {
                Group.findById(group, async (err, response) => {
                    if (err) {
                        const customError = createCustomError(404, 'Bad request', [])
                        res.status(404).send(customError)
                    }
                    else {
                        if (response === null) {
                            deletedGroupTrigger = true;
                            numberOfDeletedGroups++;
                            const newGroups = req.user.groups.filter(newGroup => newGroup.toString() !== group.toString());
                            req.user.groups = newGroups;
                            req.user.save();
                        }

                        else {
                            sendData.push(response);
                        }

                        if (!deletedGroupTrigger) {
                            if (sendData.length === req.user.groups.length) {
                                const sendObject = createSendObject(200, "Groups retrieved successfully!", sendData);
                                res.status(200).send(sendObject);
                            }
                        } else {
                            if (sendData.length === originalGroupsLength - numberOfDeletedGroups) {
                                if (sendData.length === 0) {
                                    const sendObject = createSendObject(204, 'User is not a part of any groups!', []);
                                    res.status(204).send(sendObject);
                                } else {
                                    const sendObject = createSendObject(200, "Groups retrieved successfully!", sendData);
                                    res.status(200).send(sendObject)
                                }
                            }
                        }
                    }
                });
            })
        }
        else {
            const sendObject = createSendObject(204, 'User is not a part of any groups!', []);
            res.status(204).send(sendObject);
        }
    }
})

//Login User
userRouter.post('/sign-in', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        const id = new ObjectID(process.env.STATS_ID)
        Stats.findById(id, async (err, statsResponse) => {
            if(err){
                const sendObject = createSendObject(200, "Logged in successfully!", { user, token });
                res.status(200).send(sendObject);
            }

            const sendObject = createSendObject(200, "Logged in successfully!", { user, token, latestBets: statsResponse.latestBets, popularBets: statsResponse.popularBets });
            res.status(200).send(sendObject);
        })
    } 
    
    catch (err) {
        const customError = createCustomError(401, "Email/Password combination is not correct!", err);
        res.status(401).send(customError)
    }
})

//Logout User
userRouter.post('/sign-out', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        const sendObject = createSendObject(200, "User logged out!", [])
        res.status(200).send(sendObject);
    } catch (err) {
        const customError = createCustomError(500, "Error occured during sign out!", err)
        res.status(500).send(customError);
    }
})

//Change passsword
userRouter.post('/change-account-details', auth, async (req, res) => {
    if (req.headers.type === "password") {
        const hashPromise = bcryptjs.compare(req.body.oldPassword, req.user.password);
        hashPromise.then(async hashRes => {
            if (hashRes) {
                req.user.password = req.body.newPassword;
                try {
                    await req.user.save();
                    const sendObject = createSendObject(200, "Password changed successfully!", [])
                    res.status(200).send(sendObject);
                }

                catch (err) {
                    const customError = createCustomError(500, "Could not save password at the moment!", []);
                    res.status(500).send(customError)
                }
            }

            else {
                const customError = createCustomError(400, "Old password is not correct!", []);
                res.status(400).send(customError)
            }
        }).catch(err => {
            const customError = createCustomError(400, "Old password is not correct!", []);
            res.status(400).send(customError)
        })
    }
    else if (req.headers.type === "email") {
        try {
            req.user.email = req.body.email;
            await req.user.save();
            const sendObject = createSendObject(201, "Email changed successfully!", req.user.email);
            res.status(201).send(sendObject);
        }

        catch (err) {
            if (err.code === 11000) {
                const customError = createCustomError(400, "Email is already in use!", err);
                res.status(400).send(customError);
            }

            else {
                const customError = createCustomError(500, "Could not change email at the moment!", []);
                res.status(500).send(customError);
            }
        }
    }
    else if (req.headers.type === "nickname") {
        let peopleNotificationsArray = [];
        const oldUser = req.user.nickname;
        //Provjera da li je nickname zauzet
        await User.find({ nickname: req.body.nickname }, async (err, userResponse) => {
            if (err) {
                const customError = createCustomError(400, "Enter valid nickname", []);
                res.status(400).send(customError)
            }

            if (userResponse.length !== 0) {
                const customError = createCustomError(400, "Nickname is already taken!", [])
                res.status(400).send(customError);
            }

            else {
                try {
                    //Promjena imena u opkladama unutar grupa u kojim je User
                    await req.user.groups.forEach(async group => {
                        let id = new ObjectID(group);
                        await Group.findById(id, async (err, groupResponse) => {
                            //Array za notifikacije
                            peopleNotificationsArray.push(...groupResponse.people);

                            //Promjena imena u arrayima:
                            const peopleIndex = groupResponse.people.indexOf(oldUser);
                            const newPeople = [...groupResponse.people];
                            if (peopleIndex !== -1) {
                                newPeople[peopleIndex] = req.body.nickname;
                            }

                            groupResponse.activeBets = helpers.changeNicknameInBets(groupResponse.activeBets, "activeBets", oldUser, req.body.nickname);
                            groupResponse.finishedBets = helpers.changeNicknameInBets(groupResponse.finishedBets, "finishedBets", oldUser, req.body.nickname);
                            groupResponse.betsWaitingForAddApproval = helpers.changeNicknameInBets(groupResponse.betsWaitingForAddApproval, "betsWaitingForAddApproval", oldUser, req.body.nickname);
                            groupResponse.betsWaitingForEditApproval = helpers.changeNicknameInBets(groupResponse.betsWaitingForEditApproval, "betsWaitingForEditApproval", oldUser, req.body.nickname);
                            groupResponse.betsWaitingForFinishedApproval = helpers.changeNicknameInBets(groupResponse.betsWaitingForFinishedApproval, "betsWaitingForFinishedApproval", oldUser, req.body.nickname);
                            groupResponse.people = newPeople;

                            //Provjera da li je admin grupe i zamjena
                            if (groupResponse.admin === oldUser) {
                                groupResponse.admin = req.body.nickname;
                            }
                            groupResponse.markModified('activeBets');
                            groupResponse.markModified('finishedBets');
                            groupResponse.markModified('betsWaitingForAddApproval');
                            groupResponse.markModified('betsWaitingForEditApproval');
                            groupResponse.markModified('betsWaitingForFinishedApproval');
                            groupResponse.markModified('people');
                            await groupResponse.save();
                        })
                    })

                    //Promjena unutar grupa u koje je pozvan
                    await Group.find({}, async (err, allGroupsResponse) => {
                        await allGroupsResponse.forEach(async group => {
                            let index = group.invitedPeople.indexOf(oldUser);
                            if (index !== -1) {
                                group.invitedPeople[index] = req.body.nickname;
                                group.markModified('invitedPeople');
                                await group.save();
                            }
                        })
                    })


                    let filteredFunction = (names) => names.filter((nickname, i) => {
                        return names.indexOf(nickname) === i;
                    })

                    const filteredArray = filteredFunction(peopleNotificationsArray);
                    const notificationText = `${oldUser} changed the nickame to ${req.body.nickname}`;
                    notificationEmitter.emit('send notifications', oldUser, filteredArray, { data: {}, needsResolving: false, notificationText, seen: false, type: "nickname change" }, false, null);
                    req.user.nickname = req.body.nickname;
                    await req.user.save();
                    const sendObject = createSendObject(200, "Nickname changed successfully!", req.user.nickname)
                    res.status(200).send(sendObject);
                }

                catch (err) {
                    const customError = createCustomError(500, "Could not change nickname at the moment!", err);
                    res.status(500).send(customError);
                }
            }
        })
    }
})

//Deactivate account
userRouter.post('/deactivate-account', auth, async (req, res) => {
    let peopleNotificationsArray = [];
    let adminTransfer = [];
    const groupLength = req.user.groups.length;
    let promiseGroupLength = [];
    const userToDeleteNickname = req.user.nickname;
    if (groupLength > 0) {
        req.user.groups.forEach((group, index) => {
            let id = new ObjectID(group);
            Group.findById(id, async (err, groupResponse) => {
                //Ako je jedini User u grupi
                if (groupResponse.people.length === 1) {
                    const deleted = await groupResponse.remove();
                    promiseGroupLength.push(deleted);
                }
                else {
                    //Prebacivanje admina na drugu osobu
                    if (groupResponse.admin === userToDeleteNickname) {
                        groupResponse.admin = groupResponse.people[1];
                        const newAdminObject = {
                            nickname: groupResponse.people[1],
                            groupName: groupResponse.name
                        }
                        adminTransfer.push(newAdminObject);
                    }
                    peopleNotificationsArray.push(...groupResponse.people);
                    //Brisanje iz people array
                    const newPeople = groupResponse.people.filter(person => person !== userToDeleteNickname);
                    groupResponse.people = newPeople;
                    groupResponse.activeBets = helpers.deleteUserBets(groupResponse.activeBets, userToDeleteNickname);
                    groupResponse.finishedBets = helpers.deleteUserBets(groupResponse.finishedBets, userToDeleteNickname);
                    groupResponse.betsWaitingForAddApproval = helpers.deleteUserBets(groupResponse.betsWaitingForAddApproval, userToDeleteNickname);
                    groupResponse.betsWaitingForEditApproval = helpers.deleteUserBets(groupResponse.betsWaitingForEditApproval, userToDeleteNickname);
                    groupResponse.betsWaitingForFinishedApproval = helpers.deleteUserBets(groupResponse.betsWaitingForFinishedApproval, userToDeleteNickname);

                    groupResponse.markModified('people');
                    groupResponse.markModified('activeBets');
                    groupResponse.markModified('finishedBets');
                    groupResponse.markModified('betsWaitingForAddApproval');
                    groupResponse.markModified('betsWaitingForEditApproval');
                    groupResponse.markModified('betsWaitingForFinishedApproval');

                    let result = await groupResponse.save();
                    promiseGroupLength.push(result);

                    if (groupLength === promiseGroupLength.length) {
                        let filteredFunction = (names) => names.filter((nickname, i) => {
                            return names.indexOf(nickname) === i;
                        })

                        const filteredArray = filteredFunction(peopleNotificationsArray);
                        const notificationText = `${userToDeleteNickname} has deleted his profile, so all bets including him have been deleted!`;
                        notificationEmitter.emit('send notifications', userToDeleteNickname, filteredArray, { data: {}, needsResolving: false, notificationText, seen: false, type: "account deleted" }, false, null);

                        await req.user.remove();
                        const sendObject = createSendObject(200, "You have deleted your account!", []);
                        res.status(200).send(sendObject);
                    }
                }
            })
        })
    }
    //Ako nije ni u jednoj grupi!
    else {
        await req.user.remove();
        const sendObject = createSendObject(200, "You have deleted your account!", []);
        res.status(200).send(sendObject)
    }
})

//Get public profile
userRouter.get('/profile/:nickname', async (req, res) => {
    const userPromise = User.find({ nickname: req.headers.data })

    userPromise.then(userResponse => {
        const userGroups = [];
        userResponse[0].groups.forEach((group, idx) => {
            const id = new ObjectID(group);
            Group.findById(id, async (err, groupResponse) => {
                userGroups.push(groupResponse);

                if (userGroups.length === userResponse[0].groups.length) {
                    const balance = helpers.calculateBalance(userGroups, userResponse[0].nickname);
                    balance.imgSource = userResponse[0].avatarLocation;
                    const sendObject = createSendObject(200, "Public profile sent", balance)
                    res.status(200).send(sendObject);
                }
            })

        })
    }).catch(err => {
        const customError = createSendObject(404, "User not found!", err);
        res.status(404).send(customError);
    })
})

//Resend password
userRouter.post('/resend-password', async (req, res) => {
    const userPromise = User.find({ email: req.body.email });
    userPromise.then(async userResponse => {
        if (userResponse.length !== 0) {
            if (userResponse[0].resetPasswordLink) {
                const customError = createCustomError(400, "Reset password link has already been sent to your email!", [])
                return res.status(400).send(customError)
            }

            else {
                const userUID = userResponse[0]._id;
                const urlID = new ObjectID();
                userResponse[0].resetPasswordLink = urlID;
                await userResponse[0].save();

                const transporter = nodemailer.createTransport({
                    service: "hotmail",
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: req.body.email,
                    subject: "Reset your password on your Bet platform",
                    text: `Reset your password on the link here: https://spaha-betapp.netlify.app/reset-password/${userUID}/${urlID}`
                }

                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        const customError = createCustomError(500, "Could not send resend password email!", [])
                        res.status(400).send(customError);
                    }

                    else {
                        const sendObject = createSendObject(200, 'Password reset link has been sent to the provided email!', [])
                        res.status(200).send(sendObject)
                    }
                })
            }
        }

        else {
            const customError = createCustomError(400, "No user with that email!", err)
            res.status(400).send(customError)
        }

    }).catch(err => {
        const customError = createCustomError(400, "No user with that email!", err)
        res.status(400).send(customError)
    })
})

//Check Reset password email link
userRouter.get('/reset-password/:uid/:id', async (req, res) => {
    let uid = new ObjectID(req.params.uid);
    User.findById(uid, async (err, userResponse) => {
        if (userResponse.resetPasswordLink === req.params.id.toString()) {
            const sendObject = createSendObject(200, 'Email link is valid!', []);
            res.status(200).send(sendObject);
        }

        else {
            const customError = createCustomError(401, "Email link is not valid!", []);
            res.status(401).send(customError);
        }
    })
})

//Post Reset password
userRouter.post('/reset-password/:uid/:id', async (req, res) => {
    let uid = new ObjectID(req.params.uid);
    User.findById(uid, async (err, userResponse) => {
        if (userResponse.resetPasswordLink === req.params.id.toString()) {
            const passCheck = await bcryptjs.compare(req.body.password, userResponse.password);
            if (passCheck) {
                const customError = createCustomError(400, "New password cannot be same as the old password!", [])
                return res.status(400).send(customError);
            }

            else {
                userResponse.password = req.body.password;
                userResponse.resetPasswordLink = "";
                await userResponse.save();
                const sendObject = createSendObject(200, "Password changed successfully!", [])
                res.status(200).send(sendObject)
            }
        }

        else {
            const customError = createCustomError(400, "Email link is not valid!", [])
            res.status(401).send(customError);
        }
    })
})

userRouter.post('/change-profile-picture', auth, upload.single('file'), async (req, res) => {
    req.user.avatarLocation = req.file.path;
    try {
        await req.user.save();
        const sendObject = createSendObject(200, 'Profile picture updated successfully!', req.user);
        return res.status(200).send(sendObject);
    }

    catch (err) {
        const customError = createCustomError(500, "Could not change picture!", []);
        res.status(500).send(customError);
    }
})

userRouter.post('/sign-up', upload.single('file'), async (req, res, next) => {
    //Creating new group
    const userObject = JSON.parse(JSON.stringify(req.body));
    if (userObject.newGroup === "true") {
        const user = new User(userObject);
        if (req.file) {
            user.avatarLocation = req.file.path;
        }
        let newPeople = [userObject.nickname];
        const group = new Group({
            activeBets: [],
            finishedBets: [],
            betsWaitingForAddApproval: [],
            betsWaitingForFinishedApproval: [],
            betsWaitingForEditApproval: [],
            people: newPeople,
            name: userObject.groupName,
            admin: userObject.nickname
        })

        await group.save(async function (err, data) {
            if (err) {
                const customError = createCustomError(500, 'Could not create group!', err);
                res.status(500).send(customError)
            }
            else {
                user.groups = [];
                user.groups.push(data._id.toString());
                try {
                    await user.save();
                    const token = await user.generateAuthToken();
                    const id = new ObjectID(process.env.STATS_ID);
                    Stats.findById(id, async (err, statsResponse) => {
                        if(err){
                            const sendObject = createSendObject(200, "Profile created!", { user, token })
                            res.status(200).send(sendObject)
                        }

                        const sendObject = createSendObject(200, "Profile created!", { user, token, latestBets : statsResponse.latestBets, popularBets: statsResponse.popularBets })
                        res.status(200).send(sendObject)
                    })
                } 
                
                catch (err) {
                    await Group.findByIdAndDelete(data._id.toString())
                    let notUnique;
                    const errorKeys = Object.keys(err.keyValue);
                    if (errorKeys[0] === "email") {
                        notUnique = "Email is already registered!";
                    } else {
                        notUnique = "Nickname is taken. Please select a diferent one!";
                    }
                    const customError = createCustomError(400, notUnique, err)
                    res.status(400).send(customError);
                }
            }
        });
    }

    //Adding new person to the group
    else {
        try {
            const id = new ObjectID(userObject.groupId);
            Group.findById(id, async function (err, responseGroup) {
                if (err) {
                    const customError = createCustomError(404, 'Could not find group with that ID!', err)
                    res.status(404).send(customError);
                }

                else {
                    const user = new User(userObject);
                    if (req.file) {
                        user.avatarLocation = req.file.path;
                    }

                    try {
                        const notificationText = `${userObject.nickname} wants to join your group ${responseGroup.name}`;
                        notificationEmitter.emit('send notifications', userObject.nickname, [responseGroup.admin], { data: { user: userObject.nickname, groupId: responseGroup._id }, needsResolving: true, notificationText, seen: false, type: "accept user to group" }, false, null);
                        try {
                            await user.save();
                            const token = await user.generateAuthToken();
                            const id = new ObjectID(process.env.STATS_ID);
                            Stats.findById(id, async (err, statsResponse) => {
                                if(err){
                                    const sendObject = createSendObject(201, "Profile created!", { user, token })
                                    res.status(201).send(sendObject);
                                }

                                const sendObject = createSendObject(201, "Profile created!", { user, token, latestBets:statsResponse.latestBets, popularBets:statsResponse.popularBets })
                                res.status(201).send(sendObject);
                            })
                       
                        }
                        catch (err) {
                            responseUser[0].notifications.pop();
                            await responseUser[0].save();
                            const customError = createCustomError(400, ' Could not save user!', err);
                            res.status(400).send(customError);
                        }
                    }

                    catch (err) {
                        const customError = createCustomError(503, "Could not add user to the group!", err)
                        res.status(503).send(customError);
                    }
                }
            })
        } catch (err) {
            const customError = createCustomError(404, 'ID of the group you want to join is invalid!', err)
            res.status(400).send(customError);
        }
    }
});

module.exports = userRouter;