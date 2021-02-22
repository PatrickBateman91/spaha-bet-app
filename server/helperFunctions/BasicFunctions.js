const changeNicknameInBets = (betArray, betArrayName, nickname, newNickname) => {
    const changeInside = (innerBet, innerArray, innerNickname, innerNewNickname) => {
        let innerIndex = innerBet[innerArray].indexOf(innerNickname);
        if (innerIndex !== -1) {
            innerBet[innerArray][innerIndex] = innerNewNickname;
        }
    }
    betArray.forEach(bet => {
        if (bet.jointBet) {
            if (betArrayName === "finishedBets" || betArrayName === "betsWaitingForFinishedApproval") {
                changeInside(bet, 'winner', nickname, newNickname);
            }
            let firstIndex = bet.participants[0].participants.indexOf(nickname);
            if (firstIndex !== -1) {
                bet.participants[0].participants[firstIndex] = newNickname;
                return;
            }

            let secondIndex = bet.participants[1].participants.indexOf(nickname);
            if (secondIndex !== -1) {
                bet.participants[1].participants[secondIndex] = newNickname;
            }
            changeInside(bet, 'approvedAddArray', nickname, newNickname);
            changeInside(bet, 'approvedEditArray', nickname, newNickname);
            changeInside(bet, 'approvedFinishArray', nickname, newNickname);

            if (betArray === "betsWaitingForEditApproval") {
                let firstIndex = bet.originalBet.participants[0].participants.indexOf(nickname);
                if (firstIndex !== -1) {
                    bet.originalBet.participants[0].participants[firstIndex] = newNickname;
                    return;
                }

                let secondIndex = bet.originalBet.participants[1].participants.indexOf(nickname);
                if (secondIndex !== -1) {
                    bet.originalBet.participants[1].participants[secondIndex] = newNickname;
                }
                changeInside(bet.originalBet, 'approvedAddArray', nickname, newNickname);
                changeInside(bet.originalBet, 'approvedEditArray', nickname, newNickname);
                changeInside(bet.originalBet, 'approvedFinishArray', nickname, newNickname);
            }
        }
        else {
            if (betArrayName === "finishedBets" || betArrayName === "betsWaitingForFinishedApproval") {
                if (bet.winner === nickname) {
                    bet.winner = newNickname;
                }
            }
            for (let i = 0; i < bet.participants.length; i++) {
                if (bet.participants[i].name === nickname) {
                    bet.participants[i].name = newNickname;
                    break;
                }
            }
            changeInside(bet, 'approvedAddArray', nickname, newNickname);
            changeInside(bet, 'approvedEditArray', nickname, newNickname);
            changeInside(bet, 'approvedFinishArray', nickname, newNickname);

            if (betArray === "betsWaitingForEditApproval") {
                for (let i = 0; i < bet.originalBet.participants.length; i++) {
                    if (bet.originalBet.participants[i].name === nickname) {
                        bet.originalBet.participants[i].name = newNickname;
                        break;
                    }
                }
                changeInside(bet.originalBet, 'approvedAddArray', nickname, newNickname);
                changeInside(bet.originalBet, 'approvedEditArray', nickname, newNickname);
                changeInside(bet.originalBet, 'approvedFinishArray', nickname, newNickname);
            }
        }
    })

    return betArray;
}

const deleteUserBets = (betArray, nickname) => {

    const newBetArray = [];
    let trigger = false;
    for (let i = 0; i < betArray.length; i++) {
        if (betArray[i].jointBet) {
            if (betArray[i].participants[0].participants.indexOf(nickname) !== -1) {
                trigger = true;
            }
            if (betArray[i].participants[1].participants.indexOf(nickname) !== -1) {
                trigger = true;
            }
            if (!trigger) {
                newBetArray.push(betArray[i]);
            }
        }
        else {
            let trigger = false;
            for (let j = 0; j < betArray[i].participants.length; j++) {
                if (betArray[i].participants[j].name === nickname) {
                    trigger = true;
                    break;
                }
            }
            if (!trigger) {
                newBetArray.push(betArray[i]);
            }
        }
    }

    return newBetArray;
}

const calculateBalance = (groups, nickname) => {
    let activeBets = 0;
    let finishedBets = 0;
    let betsWon = 0;
    let betsLost = 0;
    let groupNames = [];
    let balance = 0;
    groups.forEach(group => {
        groupNames.push(group.name);
        group.finishedBets.forEach(bet => {
            if (bet.winner !== "nobody") {
                if (bet.jointBet) {
                    let userBetTrigger = false;
                    let userSide = "";
                    if (bet.participants[0].participants.indexOf(nickname) !== -1) {
                        userBetTrigger = true;
                        userSide = "left";
                    }
                    if (bet.participants[1].participants.indexOf(nickname) !== .1) {
                        userBetTrigger = true;
                        userSide = "right";
                    }
                    if (userBetTrigger) {
                        finishedBets++;
                        if (bet.winner.indexOf(nickname) !== -1) {
                            betsWon++;
                            if (bet.type === "money") {
                                if (userSide === "left") {
                                    balance += parseFloat(bet.participants[0].bet / bet.participants[0].participants.length)
                                }
                                else if (userSide === "right") {
                                    balance += parseFloat(bet.participants[1].bet / bet.participants[1].participants.length)
                                }
                            }
                            else if (bet.type === "other") {
                                if (userSide === "left") {
                                    if (!isNaN(bet.participants[0].bet)) {
                                        balance += parseFloat(bet.participants[0].bet / bet.participants[0].participants.length);
                                    }
                                }
                                else if (userSide === "right") {
                                    if (!isNaN(bet.participants[0].bet)) {
                                        balance += parseFloat(bet.participants[1].bet / bet.participants[1].participants.length);
                                    }
                                }
                            }
                        }
                        else {
                            betsLost++;
                            if (bet.type === "money") {
                                if (userSide === "left") {
                                    balance -= parseFloat(bet.participants[1].bet / bet.participants[0].participants.length)
                                }
                                else if (userSide === "right") {
                                    balance -= parseFloat(bet.participants[0].bet / bet.participants[1].participants.length)
                                }
                            }
                            else if (bet.type === "other") {
                                if (userSide === "left") {
                                    if (!isNaN(bet.participants[1].bet)) {
                                        balance -= parseFloat(bet.participants[1].bet / bet.participants[0].participants.length);
                                    }
                                }
                                else if (userSide === "right") {
                                    if (!isNaN(bet.participants[0].bet)) {
                                        balance -= parseFloat(bet.participants[0].bet / bet.participants[1].participants.length);
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    let userBetTrigger = false;
                    for (let i = 0; i < bet.participants.length; i++) {
                        if (bet.participants[i].name === nickname) {
                            userBetTrigger = true;
                            break;
                        }
                    }
                    if (userBetTrigger) {
                        finishedBets++;
                        if (bet.differentStakes) {
                            if (bet.participants[0].name === nickname) {
                                if (nickname === bet.winner) {
                                    betsWon++;
                                    if (!isNaN(bet.participants[0].singleStake)) {
                                        balance += parseFloat(bet.participants[0].singleStake);
                                    }
                                }
                                else {
                                    betsLost++;
                                    if (!isNaN(bet.participants[1].singleStake)) {
                                        balance -= parseFloat(bet.participants[1].singleStake);
                                    }
                                }
                            }
                            else {
                                if (nickname === bet.winner) {
                                    betsWon++;
                                    if (!isNaN(bet.participants[1].singleStake)) {
                                        balance += parseFloat(bet.participants[1].singleStake);
                                    }
                                }
                                else {
                                    betsLost++;
                                    if (!isNaN(bet.participants[0].singleStake)) {
                                        balance -= parseFloat(bet.participants[0].singleStake);
                                    }
                                }
                            }
                        }
                        else {
                            if (bet.type === "money") {
                                if (nickname === bet.winner) {
                                    betsWon++;
                                    balance += bet.amount * parseFloat((bet.participants.length - 1))
                                }
                                else {
                                    betsLost++;
                                    balance -= parseFloat(bet.amount);
                                }
                            } else {
                                if (nickname === bet.winner) {
                                    betsWon++;
                                }
                                else {
                                    betsLost++;
                                }
                            }
                        }
                    }
                }
            }
        })
        group.activeBets.forEach(bet => {

            if (bet.jointBet) {
                let userBetTrigger = false;
                if (bet.participants[0].participants.indexOf(nickname) !== -1) {
                    userBetTrigger = true;
                }
                if (bet.participants[1].participants.indexOf(nickname) !== .1) {
                    userBetTrigger = true;
                }
                if (userBetTrigger) {
                    activeBets++;
                }
            }
            else {
                let userBetTrigger = false;
                for (let i = 0; i < bet.participants.length; i++) {
                    if (bet.participants[i].name === nickname) {
                        userBetTrigger = true;
                        break;
                    }
                }
                if (userBetTrigger) {
                    activeBets++;
                }
            }

        })
    })
    return {
        activeBets,
        balance,
        betsWon,
        betsLost,
        finishedBets,
        groupNames
    }
}

const joinGroupDuplicateCheck = (notifications, user, ID) => {
    for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].type === "accept user to group") {
            if (notifications[i].data.user === user) {
                if (notifications[i].data.groupId.toString() === ID.toString()) {
                    return true;
                }
            }
        }
    }

    return false;
}

module.exports = {
    calculateBalance,
    changeNicknameInBets,
    deleteUserBets,
    joinGroupDuplicateCheck
};