const express = require('express');
const Bet = require('../models/BetModel');
const auth = require('../middleware/AuthUserCheck');
const Group = require('../models/GroupModel');
const User = require('../models/UserModel');
const ObjectID = require('mongodb').ObjectID;

const betsRouter = new express.Router();

betsRouter.post('/add-bet', auth, async (req, res) => {
    let includesUserCheck = false;
    let peopleArray = [];
    if (req.body.bet.jointBet) {
        req.body.bet.participants.forEach(side => {
            if (side.participants.indexOf(req.user.nickname) !== -1) {
                includesUserCheck = true;
            }
            peopleArray.push(...side.participants);
        })
    }
    else {
        req.body.bet.participants.forEach(participant => {
            if (participant.name === req.user.nickname) {
                includesUserCheck = true;
            }
            peopleArray.push(participant.name);
        })
    }
    if (!includesUserCheck) {
        return res.status(400).send("You can't add bets that don't involve you!")
    }
    try {
        let bet = new Bet(req.body.bet);
        await Group.findById(req.body.selectedGroup, async (err, response) => {
            if (err) {
                res.send("Unable to find group!")
            }
            else {
                let outsiderTrigger = false;
                peopleArray.forEach(person => {
                    if (response.people.indexOf(person) === -1) {
                        outsiderTrigger = true;
                    }
                })
                if (outsiderTrigger) {
                    return res.status(400).send("You can't add bets with unregistered people!")
                }
                bet.approvedAddArray = [req.user.nickname];
                response.betsWaitingForAddApproval.push(bet);
                await response.save()
                res.send('Success!')
            }
        })

    }
    catch (err) {
        console.log(err);
    }

})

betsRouter.post('/active-bets', auth, async (req, res) => {
    if (req.headers.type === "finishRequest") {
        const id = new ObjectID(req.body.groupId);
        Group.findById(id, async (err, groupResponse) => {
            if (err) {
                return res.status(400).status("Could not finish bet!");
            }
            const filteredActive = groupResponse.activeBets.filter(bet => {
                return bet._id.toString() !== req.body.bet._id.toString();
            });
            groupResponse.activeBets = filteredActive;
            const changedBet = req.body.bet;
            changedBet.approvedFinishArray.push(req.user.nickname);
            changedBet.winner = req.body.winner;
            groupResponse.betsWaitingForFinishedApproval.push(changedBet);
            try {
                await groupResponse.save()
                res.send(groupResponse);
            } catch (err) {
                res.status(500).send("Could not upload changes!")
            }
        })
    }
    else if (req.headers.type === "editBet") {
        const id = new ObjectID(req.body.groupId);
        Group.findById(id, async (err, groupResponse) => {
            if (err) {
                return res.status(400).status("Could not edit bet!");
            }
            const filteredBets = groupResponse.activeBets.filter(bet => bet._id.toString() !== req.body.bet._id.toString());
            const originalBet = groupResponse.activeBets.filter(bet => bet._id.toString() === req.body.bet._id.toString());
            groupResponse.activeBets = filteredBets;
            const changedBet = req.body.bet;
            changedBet.originalBet = originalBet;
            changedBet.approvedEditArray.push(req.user.nickname);
            groupResponse.betsWaitingForEditApproval.push(changedBet);
         
           try{
            groupResponse.markModified('activeBets');
            groupResponse.markModified('betsWaitingForEditApproval');
            await groupResponse.save();
              res.send("Bet was edited succesfully!");
           }catch(err){
               console.log("Ja 2222")
               res.status(400).send("Bet could not be edited!")
           }
        })
    }
})

betsRouter.post('/bet-approvals', auth, async (req, res) => {
    let reqGroup, reqArray, reqSecondArray, notificationText;
    const id = new ObjectID(req.body.groupId);
    switch (req.headers.type) {
        case "add":
            reqGroup = "betsWaitingForAddApproval";
            reqArray = "approvedAddArray";
            reqSecondArray = "activeBets";
            notificationText = "declined the bet offer!"
            break

        case "edit":
            reqGroup = "betsWaitingForEditApproval";
            reqArray = "approvedEditArray";
            reqSecondArray = "activeBets";
            notificationText = "declined bet edit!"
            break

        case "finish":
            reqGroup = "betsWaitingForFinishedApproval";
            reqArray = "approvedFinishArray";
            reqSecondArray = "finishedBets";
            notificationText = "denies that your bet finished!"
            break

        default:
            return res.status(404).send('Bad request!')
    }
    Group.findById(id, async (err, groupResponse) => {
        if (err) {
            return res.status(400).send("Oops. Can't approve bet at the moment!")
        }
        let indexOfBet;
        let filteredBet = groupResponse[reqGroup].filter((bet, idx) => {
            if (bet._id.toString() === req.body.betId.toString()) {
                indexOfBet = idx
            }
            return bet._id.toString() === req.body.betId.toString();
        });

        filteredBet = filteredBet[0];
        if (req.body.answer === "Accept") {
            if (filteredBet[reqArray].indexOf(req.user.nickname) !== -1) {
                return res.status(400).send("You already approved this bet!")
            }
            if (filteredBet.jointBet) {

                if (filteredBet[reqArray].length + 1 === (filteredBet.participants[0].participants.length + filteredBet.participants[1].participants.length)) {
                    const newArray = groupResponse[reqGroup].filter(bet => {
                        return bet._id.toString() !== req.body.betId.toString()
                    });
                    filteredBet[reqArray] = [];
                    if (req.headers.type === "finish") {
                        filteredBet.finished = true;
                    }
                    groupResponse[reqSecondArray].push(filteredBet);
                    groupResponse[reqGroup] = newArray;
                    await groupResponse.save()
                    res.send(groupResponse);
                }
                else {
                    groupResponse[reqGroup][indexOfBet][reqArray].push(req.user.nickname);
                    groupResponse.markModified(reqGroup);
                    await groupResponse.save();
                    res.send(groupResponse);
                }
            }
            else {
                if (filteredBet[reqArray].length + 1 === filteredBet.participants.length) {
                    const newArray = groupResponse[reqGroup].filter(bet => {
                        return bet._id.toString() !== req.body.betId.toString()
                    });

                    filteredBet[reqArray] = [];
                    if (req.headers.type === "finish") {
                        filteredBet.finished = true;
                    }
                    groupResponse[reqSecondArray].push(filteredBet);
                    groupResponse[reqGroup] = newArray;
                    await groupResponse.save()
                    res.send(groupResponse);
                }
                else {
                    groupResponse[reqGroup][indexOfBet][reqArray].push(req.user.nickname);
                    groupResponse.markModified(reqGroup);
                    await groupResponse.save();
                    return res.send(groupResponse);
                }
            }
        }
        else if (req.body.answer === "Decline") {
            const newArray = groupResponse[reqGroup].filter(bet => {
                return bet._id.toString() !== req.body.betId.toString()
            });
            groupResponse[reqGroup] = newArray;
            let usersToQuerry = [];
            if (filteredBet.jointBet) {
                usersToQuerry.push(...filteredBet.participants[0].participants);
                usersToQuerry.push(...filteredBet.participants[1].participants)
            }
            else {
                usersToQuerry = filteredBet.participants.map(person => person.name);
            }
            await usersToQuerry.forEach(user => {
                User.find({ nickname: user }, async (err, userResponse) => {
                    if (userResponse[0].nickname !== req.user.nickname) {
                        const newNotification = {
                            title: `${req.user.nickname} ${notificationText}`,
                            data: { bet: filteredBet },
                            seen:false,
                            timestamp: new Date(),
                            type:`${req.user.nickname} ${notificationText}`,
                            needsResolving:false,
                            _id: new ObjectID()
                        }
                        userResponse[0].notifications.push(newNotification);
                        await userResponse[0].save();
                    }
                })
            })
            if (req.headers.type === "finish") {
                filteredBet.winner = "";
                filteredBet.approvedFinishArray = [];
                groupResponse.activeBets.push(filteredBet);
            }
            if(req.headers.type === "edit"){
                let originalBet = filteredBet.originalBet[0];
                groupResponse.activeBets.push(originalBet);
            }
            await groupResponse.save();
            res.send(groupResponse);
        }
    })

})

module.exports = betsRouter;