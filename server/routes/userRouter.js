const express = require('express');
const bcryptjs = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const User = require('../models/UserModel');
const Group = require('../models/GroupModel');
const ObjectID = require('mongodb').ObjectID;
const auth = require('../middleware/AuthUserCheck');
const userRouter = new express.Router();
const helpers = require('../helperFunctions/BasicFunctions');
const nodemailer = require('nodemailer');

const DIR = './public';

//Get Data
userRouter.get('/', auth, async (req, res) => {
    if (req.headers.type === "get user") {
        res.send(req.user);
    }

    else if (req.headers.type === "get groups") {
        let sendData = [];
        if (req.user.groups.length !== 0) {
            await req.user.groups.forEach(async (group, index) => {
                await Group.findById(group, (err, response) => {
                    if (err) {
                        console.log("Ja")
                        console.log(err);
                        //res.send("Unable to find group!")
                    }
                    else {
                        sendData.push(response);
                        if (sendData.length === req.user.groups.length) {
                            res.send(sendData);
                        }
                    }
                });
            })
        }
        else {
            res.status(200).send('User is not a part of any groups!');
        }

    } 
})

//Login User
userRouter.post('/sign-in', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (err) {
        res.status(404).send("Email/Password combination is not correct!");
    }
})

//Logout User
userRouter.post('/sign-out', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.send('User logged out!');
    } catch (err) {
        res.send("Error occured during sign out!");
    }
})

//Change passsword
userRouter.post('/change-account-details', auth, async (req, res) => {
    if (req.headers.type === "password") {
        const passCheck = await bcryptjs.compare(req.body.oldPassword, req.user.password);

        if (!passCheck) {
            return res.status(400).send("Old password is not correct!")
        }

        req.user.password = req.body.newPassword;
        try {
            await req.user.save();
            res.send("Password changed succesfully!")
        }
        catch (err) {
            return res.status(500).send("Password could not be saved!");
        }
    }
    else if (req.headers.type === "email") {
        try {
            req.user.email = req.body.email;
            await req.user.save();
            res.send('Email changed successfully!')
        } catch (err) {
            res.status(400).send(err)
        }
    }
    else if (req.headers.type === "nickname") {
        let peopleNotificationsArray = [];
        const oldUser = req.user.nickname;
        //Provjera da li je nickname zauzet
        await User.find({ nickname: req.body.nickname }, async (err, userResponse) => {
            if (err) {
                return res.status(400).send("Name is already taken!")
            }
            if (userResponse.length !== 0) {
                return res.status(400).send("Nickname is already taken!")
            }
        })
        //Promjena imena u opkladama unutar grupa u kojim je User
        await req.user.groups.forEach(async group => {
            let id = new ObjectID(group);
            await Group.findById(id, async (err, groupResponse) => {
                if (err) {
                    return res.status(400).send("Could not find user's group!")
                }

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
                groupResponse.save(function (err, doc) {
                    if (err) return console.error(err);

                });
            })
        })

        //Promjena unutar grupa u koje je pozvan
        await Group.find({}, async (err, allGroupsResponse) => {
            if (err) {
                return res.status(400).send("Could not access public groups to change nickname!")
            }
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
        filteredArray.forEach(async (person, idx) => {
            User.find({ nickname: person }, async (err, userResponse) => {
                if (err) {
                    return res.status(400).send("Could not send notifications to users!!")
                }
                if (userResponse[0].nickname !== oldUser) {
                    const newNotification = {
                        title: `${oldUser} changed his name to ${req.body.nickname}`,
                        data: {},
                        seen: false,
                        timestamp: new Date(),
                        type: "name change",
                        needsResolving: false,
                        _id: new ObjectID()
                    }
                    userResponse[0].notifications.push(newNotification);
                    await userResponse[0].save()
                }
            })
        })
        req.user.nickname = req.body.nickname;
        await req.user.save();
        res.send("Nickname changed successfully!")
    }
})

//Deactivate account
userRouter.post('/deactivate-account', auth, async (req, res) => {
    let peopleNotificationsArray = [];
    let adminTransfer = [];
    let groupLength = req.user.groups.length;
    let userToDeleteNickname = req.user.nickname;
    if (groupLength > 0) {
        req.user.groups.forEach((group, groupIndex) => {
            let id = new ObjectID(group);
            const groupPromise = Group.findById(id);
            groupPromise.then(async groupResponse => {
                //Ako je jedini User u grupi
                if (groupResponse.people.length === 1) {
                    await groupResponse.remove();
                    await req.user.remove();
                    res.send('User deleted successfully!')
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

                    await groupResponse.save(async function (err, doc) {
                        if (err) {
                            return req.status(400).send("Could not delete user!");
                        }
                        if (groupLength === groupIndex + 1) {
                            let filteredFunction = (names) => names.filter((nickname, i) => {
                                return names.indexOf(nickname) === i;
                            })
                            const filteredArray = filteredFunction(peopleNotificationsArray);
                            filteredArray.forEach(async person => {
                                if(person !== userToDeleteNickname){
                                    User.find({ nickname: person }, async (err, userResponse) => {
                                        if (err) {
                                            return res.status(400).send("Could not send notifications to users!!")
                                        }
                                        const newNotification = {
                                            title: `${userToDeleteNickname} has deleted his profile, so all bets including him have been deleted!`,
                                            data: {},
                                            seen: false,
                                            timestamp: new Date(),
                                            type: "name change",
                                            needsResolving: false,
                                            _id: new ObjectID()
                                        }
                                        if(userResponse[0].nickname === adminTransfer[0].nickname){
                                            const adminNotification = {
                                                title: `You have been made an admin for the ${adminTransfer[0].groupName} group!`,
                                                data: {},
                                                seen: false,
                                                timestamp: new Date(),
                                                type: "name change",
                                                needsResolving: false,
                                                _id: new ObjectID()
                                            }
                     
                                            userResponse[0].notifications.push(adminNotification);
                                        }
                                        userResponse[0].notifications.push(newNotification);
                                        await userResponse[0].save()
                                    })
                                }
                            })
                            await req.user.remove();
                            res.send("You have deleted your account")
                        }
                    });
                }
            }).catch(err => {
                res.status(400).send("Could not find user's group!")
            })
        })
    } else {
        await req.user.remove();
        res.send("You have deleted your account")
    }
})

//Get public profile
userRouter.get('/profile/:nickname', auth, async (req, res) => {
    const userPromise = User.find({nickname:  req.headers.data})

    userPromise.then(userResponse => {
        const userGroups = [];
        userResponse[0].groups.forEach((group, idx) => {
            const id = new ObjectID(group);
            Group.findById(id, async(err, groupResponse) => {
                userGroups.push(groupResponse);

                if(userGroups.length === userResponse[0].groups.length){
                    const balance = helpers.calculateBalance(userGroups, userResponse[0].nickname);
                    balance.imgSource = userResponse[0].avatarLocation;
                   res.send(balance);
                }   
            })

        })
    }).catch(err => {
        res.status(404).send("User not found!")
    })
})

//Resend password
userRouter.post('/resend-password', async(req, res) =>{
    const userPromise = User.find({email: req.body.email});
    userPromise.then(async userResponse => {
       if(userResponse.length !== 0){
        if(userResponse[0].resetPasswordLink){
            return res.status(400).send("Reset password link has already been sent to your email!")
        } else{
            const userUID = userResponse[0]._id;
            const urlID = new ObjectID();
            userResponse[0].resetPasswordLink = urlID;
            await userResponse[0].save();

            const transporter = nodemailer.createTransport({
                service: "hotmail",
                auth:{
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

            transporter.sendMail(mailOptions, function(err, info){    
                if(err){
                    console.log(err);
                    res.status(400).send("Could not send resend password email!");
                } else{
                    console.log(info);
                    res.send('Password reset link has been sent to the provided email!')
                }
            })
        }


    

  

       } else{
        return res.status(400).send('No user with that email!')
       }
    }).catch(err => {
        res.status(400).send('No user with that email!')
    })
})

//Check Reset password email link
userRouter.get('/reset-password/:uid/:id', async(req, res) => {
    let uid = new ObjectID(req.params.uid);
    User.findById(uid, async (err, userResponse) => {
        if(userResponse.resetPasswordLink === req.params.id.toString()){
            res.send('Email link is valid!')
        } else{
            res.status(401).send("Email link is not valid!")
        }
    })
})

//Post Reset password
userRouter.post('/reset-password/:uid/:id', async(req, res) => {

    let uid = new ObjectID(req.params.uid);
    User.findById(uid, async (err, userResponse) => {
        if(userResponse.resetPasswordLink === req.params.id.toString()){
            const passCheck = await bcryptjs.compare(req.body.password, userResponse.password);
            if (passCheck) {
                return res.status(400).send("New password cannot be same as the old password!")
            }   else {
                userResponse.password = req.body.password;
                userResponse.resetPasswordLink = "";
                await userResponse.save();
                res.send("Password changed successfully!")
            }


            
        } else{
            res.status(401).send("Email link is not valid!")
        }
    })
})

const maxSize = 3097152;
const profilePictureStorage = multer.diskStorage({
    destination : function (req, file, cb){
        cb(null, `${DIR}/profile-pictures/`);
    },
    filename:function(req, file, cb){
        cb(null, `${req.body.nickname}-profile-picture${path.extname(file.originalname).toLowerCase()}`)
    }
})
const upload = multer({
    storage : profilePictureStorage,
    fileFilter: (req, file, cb) => {
        if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
            cb(null, true);
        } else{
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg image formats are allowed!'))
        }
    },
    limits:{fileSize: maxSize}
});

userRouter.post('/change-profile-picture', auth, upload.single('file'), async(req, res) => {
    req.user.avatarLocation = req.file.path;
    await req.user.save();
    return res.send('Picture updated successfully!');
})

userRouter.post('/sign-up', upload.single('file'), async (req, res, next) => {
        //Creating new group
        const userObject = JSON.parse(JSON.stringify(req.body)); 
        if (userObject.newGroup === "true") {
            const user = new User(userObject);
           if(req.file){
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
            try {
                await group.save(async function (err, data) {
                    if (err) {
                        console.log('Saving group failed!')
                        console.log(err);
                    }
                    else {
                        console.log("Group created successfully!")
                        user.groups = [];
                        user.groups.push(data._id.toString());
                        try {
                            await user.save();
                            const token = await user.generateAuthToken();
                            res.send({ user, token })
                        } catch (err) {
                            await Group.findByIdAndDelete(data._id.toString())
                            let notUnique;
                            const errorKeys = Object.keys(err.keyValue);
                            if(errorKeys[0] === "email"){
                                notUnique = "Email is already registered!";
                            } else{
                                notUnique = "Nickname is taken. Please select a diferent one!";
                            }
                            res.status(400).send(`${notUnique}`);
                        }
                    }
                });
            }
            catch (err) {
                console.log('Saving group failed!')
                res.status(500).send(err);
            }
        }
    
        //Adding new person to the group
        else {
            try {
                const id = new ObjectID(userObject.groupId);
                Group.findById(id, async function (err, responseGroup) {
                    if (err) {
                        console.log("jedan")
                        res.status(404).send("Could not find group with that ID!");
                    }
    
                    else {
                        const user = new User(userObject);
                        if(req.file){
                            user.avatarLocation = req.file.path;
                        }

                        try {
                            User.find({ nickname: responseGroup.admin }, async (err, responseUser) => {
                                const newNotification = {
                                    title: `${userObject.nickname} wants to join your group ${responseGroup.name}`,
                                    data: { user: userObject.nickname, groupId: responseGroup._id },
                                    seen: false,
                                    timestamp: new Date(),
                                    type: "accept user to group",
                                    needsResolving: true,
                                    _id: new ObjectID()
                                }
                                console.log("dva")
                                responseUser[0].notifications.push(newNotification);
                                await responseUser[0].save();
                            })
                            try {
                                await user.save();
                                console.log("tri")
                                const token = await user.generateAuthToken();
                                res.send({ user, token })
                            }
                            catch (err) {
                                console.log("cetiri")
                                responseUser[0].notifications.pop();
                                await responseUser[0].save();
                                res.status(400).send(err);
                            }
    
                        }
                        catch (err) {
                            console.log("pet");
                            res.status(503).send("Could not add user to the group!");
                        }
    
                    }
                })
            } catch (err) {
                console.log("sest")
                res.status(400).send('ID of the group you want to join is invalid!')
            }
        }
});

module.exports = userRouter;