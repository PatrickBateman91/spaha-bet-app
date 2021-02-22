const express = require('express');
const auth = require('../middleware/AuthUserCheck');
const createCustomError = require('../helperFunctions/createCustomError');
const createSendObject = require('../helperFunctions/createSendObjects');
const notificationEmitter = require('../emitters/sendNotifications');
const Bet = require('../models/BetModel');
const Group = require('../models/GroupModel');
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
        const customError = createCustomError(403, "You can't add bets that don't involve you!", [])
        return res.status(403).send(customError);
    }

    try {
        let bet = new Bet(req.body.bet);
        await Group.findById(req.body.selectedGroup, async (err, response) => {
            if (err) {
                const customError = createCustomError(404, "Unable to find group!", err)
                res.status(404).send(customError)
            }
            else {
                let outsiderTrigger = false;
                peopleArray.forEach(person => {
                    if (response.people.indexOf(person) === -1) {
                        outsiderTrigger = true;
                    }
                })

                if (outsiderTrigger) {
                    const customError = createCustomError(403, [], "You can't add bets with unregistered people!");
                    return res.status(403).send(customError);
                }

                bet.approvedAddArray = [req.user.nickname];
                response.betsWaitingForAddApproval.push(bet);
                await response.save()
                const sendObject = createSendObject(201, "Bet has been sent to approval!", []);
                res.status(201).send(sendObject);
            }
        })

    }

    catch (err) {
        const customError = createCustomError(500, "Could not upload bet!", err);
        res.status(500).send(customError);
    }
})

betsRouter.post('/active-bets', auth, async (req, res) => {
    if (req.headers.type === "finishRequest") {
        const id = new ObjectID(req.body.groupId);
        Group.findById(id, async (err, groupResponse) => {
            if (err) {
                const customError = createCustomError(404, "Could not finish bet!", [])
                return res.status(404).send(customError);
            }
            if (!groupResponse) {
                const customError = createCustomError(404, "Could not finish bet!", [])
                return res.status(404).send(customError);
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
                await groupResponse.save();
                const sendObject = createSendObject(200, "Finished bet has been sent for approval!", groupResponse);
                res.status(200).send(sendObject);
            } catch (err) {
                const customError = createCustomError(500, 'Could not reach server to finish bet!', []);
                res.status(500).send(customError);
            }
        })
    }
    else if (req.headers.type === "editBet") {
        const id = new ObjectID(req.body.groupId);
        Group.findById(id, async (err, groupResponse) => {
            if (err) {
                const customError = createCustomError(404, "Could not edit bet!", err);
                return res.status(404).status(customError);
            }

            if (!groupResponse) {
                const customError = createCustomError(404, "Could not find group", err);
                return res.status(404).status(customError);
            }
            const filteredBets = groupResponse.activeBets.filter(bet => bet._id.toString() !== req.body.bet._id.toString());
            const originalBet = groupResponse.activeBets.filter(bet => bet._id.toString() === req.body.bet._id.toString());
            groupResponse.activeBets = filteredBets;
            const changedBet = req.body.bet;
            changedBet.originalBet = originalBet;
            changedBet.approvedEditArray.push(req.user.nickname);
            groupResponse.betsWaitingForEditApproval.push(changedBet);

            try {
                groupResponse.markModified('activeBets');
                groupResponse.markModified('betsWaitingForEditApproval');
                await groupResponse.save();
                const sendObject = createSendObject(200, "Bet was edited succesfully!", groupResponse);
                res.status(200).send(sendObject);
            }

            catch (err) {
                const customError = createCustomError(500, 'Could not reach server to edit bet!', err);
                res.status(400).send(customError)
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
            notificationText = `${req.user.nickname} declined the bet offer!`
            break

        case "edit":
            reqGroup = "betsWaitingForEditApproval";
            reqArray = "approvedEditArray";
            reqSecondArray = "activeBets";
            notificationText = `${req.user.nickname} declined bet edit!`
            break

        case "finish":
            reqGroup = "betsWaitingForFinishedApproval";
            reqArray = "approvedFinishArray";
            reqSecondArray = "finishedBets";
            notificationText = `${req.user.nickname} denies that your bet finished!`
            break

        default:
            const customError = createCustomError(400, "Bad request", [])
            return res.status(400).send(customError);
    }

    Group.findById(id, async (err, groupResponse) => {
        if (err) {
            const customError = createCustomError(404, "Could not find the group!", []);
            return res.status(404).send(customError)
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
                const customError = createCustomError(400, "You already approved this bet!", [])
                return res.status(400).send(customError)
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
                    const sendObject = createSendObject(200, 'Bet accepted!', groupResponse)
                    res.status(200).send(sendObject);
                }
                else {
                    groupResponse[reqGroup][indexOfBet][reqArray].push(req.user.nickname);
                    groupResponse.markModified(reqGroup);
                    await groupResponse.save();
                    const sendObject = createSendObject(200, 'Bet accepted!', groupResponse)
                    res.status(200).send(sendObject);
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
                    const sendObject = createSendObject(200, 'Bet accepted!', groupResponse)
                    res.status(200).send(sendObject);
                }
                else {
                    groupResponse[reqGroup][indexOfBet][reqArray].push(req.user.nickname);
                    groupResponse.markModified(reqGroup);
                    await groupResponse.save();
                    const sendObject = createSendObject(200, 'Bet accepted!', groupResponse)
                    res.status(200).send(sendObject);
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
            notificationEmitter.emit('send notifications', req.user.nickname, usersToQuerry, { data: { bet: filteredBet }, needsResolving: false, notificationText, seen: false, type: "bet declined" }, false, null);

            if (req.headers.type === "finish") {
                filteredBet.winner = "";
                filteredBet.approvedFinishArray = [];
                groupResponse.activeBets.push(filteredBet);
            }

            if (req.headers.type === "edit") {
                let originalBet = filteredBet.originalBet[0];
                groupResponse.activeBets.push(originalBet);
            }

            await groupResponse.save();
            const sendObject = createSendObject(200, 'You declined!', groupResponse)
            res.status(200).send(sendObject);
        }
    })
})

module.exports = betsRouter;