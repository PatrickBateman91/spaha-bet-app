export const calculateBalance = (groups, nickname) => {
    let balance = 0;
    groups.forEach(group => {
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
                        if (bet.winner.indexOf(nickname) !== -1) {

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
                        if (bet.differentStakes) {
                            if (bet.participants[0].name === nickname) {
                                if (nickname === bet.winner) {
                                    if (!isNaN(bet.participants[0].singleStake)) {
                                        balance += parseFloat(bet.participants[0].singleStake);
                                    }
                                }
                                else {
                                    if (!isNaN(bet.participants[1].singleStake)) {
                                        balance -= parseFloat(bet.participants[1].singleStake);
                                    }
                                }
                            }
                            else {
                                if (nickname === bet.winner) {
                                    if (!isNaN(bet.participants[1].singleStake)) {
                                        balance += parseFloat(bet.participants[1].singleStake);
                                    }
                                }
                                else {
                                    if (!isNaN(bet.participants[0].singleStake)) {
                                        balance -= parseFloat(bet.participants[0].singleStake);
                                    }
                                }
                            }
                        }
                        else {
                            if (bet.type === "money") {
                                if (nickname === bet.winner) {
                                    balance += bet.amount * parseFloat((bet.participants.length - 1))
                                }
                                else {
                                    balance -= parseFloat(bet.amount);
                                }
                            }
                        }
                    }
                }
            }
        })
    })
    return balance;
}

export const changeSingleGroup = (groups, ID, updatedGroup) => {
    let newGroups = JSON.parse(JSON.stringify(groups));
    for (let i = 0; i < newGroups.length; i++) {
        if (newGroups[i]._id.toString() === ID.toString()) {
            newGroups[i] = updatedGroup;
            break;
        }
    }
    return newGroups;
}

export const choosePicture = (ulog) => {
    if (ulog === 1) {
        return "https://spaha-bets.herokuapp.com\\public\\general\\One-dollar-bill.jpg";
    }

    else if (ulog === 2) {
        return "https://spaha-bets.herokuapp.com\\public\\general\\Two-dollar-bill.jpg";
    }

    else if (ulog === 5) {
        return "https://spaha-bets.herokuapp.com\\public\\general\\Five-dollar-bill.jpg";
    }


    else if (ulog === 10) {
        return "https://spaha-bets.herokuapp.com\\public\\general\\Ten-dollar-bill.jpg";
    }


    else if (ulog === 20) {
        return "https://spaha-bets.herokuapp.com\\public\\general\\Twenty-dollar-bill.jpg";
    }


    else if (ulog === 50) {
        return "https://spaha-bets.herokuapp.com\\public\\general\\Fifty-dollar-bill.jpg";
    }


    else if (ulog === 100) {
        return "https://spaha-bets.herokuapp.com\\public\\general\\Hundred-dollar-bill.jpg";
    }

    else {
        return null;

    }
}

export const checkCorrectMailFormat = (email) => {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
}

export const compareArrays = (array1, array2) => {
    let a = [array1].toString();
    let b = [...array2].toString();
    return a === b;
}

export const emptyFieldsCheck = (itemToCheck) => {
    return itemToCheck !== "";
}

export const getDate = (type, givenDate) => {
    let date;
    if (type === 1) {
        date = new Date(givenDate);
    }
    else if (type === 2) {
        date = new Date();
    }

    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    let months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "oktober", "november", "december"]
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (type === 1) {
        const strTime = `${day}. ${month + 1} ${year}, - ${hours}:${minutes}:${seconds}`;
        return strTime;
    }

    else if (type === 2) {
        const strTime = `${day}. ${months[month]} ${year}, - ${hours}:${minutes}:${seconds}`;
        return strTime;
    }


}

export const getSuggestions = (groups, nickname) => {
    let peopleToAdd = [];
    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < groups[i].people.length; j++) {
            const nameCheck = groups[i].people[j];
            if (peopleToAdd.indexOf(nameCheck) === -1 && nickname !== nameCheck) {
                peopleToAdd.push(groups[i].people[j])
            }
        }
    }
    return peopleToAdd;
}

export const getShortStats = (groups, nickname) => {
    let waitingNotifications = 0;
    let totalNumberOfBets = 0;
    groups.forEach(group => {
        if (group.betsWaitingForAddApproval.length) {
            group.betsWaitingForAddApproval.forEach(bet => {
                if (bet.approvedAddArray.indexOf(nickname) === -1) {
                    if (bet.jointBet) {
                        if (bet.participants[0].participants.indexOf(nickname) !== -1) {
                            waitingNotifications++;
                        }
                        if (bet.participants[1].participants.indexOf(nickname) !== -1) {
                            waitingNotifications++;
                        }
                    }
                    else {
                        let userTrigger = false;
                        for (let i = 0; i < bet.participants.length; i++) {
                            if (bet.participants[i].name === nickname) {
                                userTrigger = true;
                                break;
                            }
                        }
                        if (userTrigger) {
                            waitingNotifications++;
                        }
                    }
                }
            })
        }
        if (group.betsWaitingForEditApproval.length) {
            group.betsWaitingForEditApproval.forEach(bet => {
                if (bet.approvedEditArray.indexOf(nickname) === -1) {
                    if (bet.jointBet) {
                        if (bet.participants[0].participants.indexOf(nickname) !== -1) {
                            waitingNotifications++;
                        }
                        if (bet.participants[1].participants.indexOf(nickname) !== -1) {
                            waitingNotifications++;
                        }
                    }
                    else {
                        let userTrigger = false;
                        for (let i = 0; i < bet.participants.length; i++) {
                            if (bet.participants[i].name === nickname) {
                                userTrigger = true;
                                break;
                            }
                        }
                        if (userTrigger) {
                            waitingNotifications++;
                        }
                    }
                }
            })
        }
        if (group.betsWaitingForFinishedApproval.length) {
            group.betsWaitingForFinishedApproval.forEach(bet => {
                if (bet.approvedFinishArray.indexOf(nickname) === -1) {
                    if (bet.jointBet) {
                        if (bet.participants[0].participants.indexOf(nickname) !== -1) {
                            waitingNotifications++;
                        }
                        if (bet.participants[1].participants.indexOf(nickname) !== -1) {
                            waitingNotifications++;
                        }
                    }
                    else {
                        let userTrigger = false;
                        for (let i = 0; i < bet.participants.length; i++) {
                            if (bet.participants[i].name === nickname) {
                                userTrigger = true;
                                break;
                            }
                        }
                        if (userTrigger) {
                            waitingNotifications++;
                        }
                    }
                }
            })
        }

        if (group.activeBets.length) {
            group.activeBets.forEach(bet => {
                if (bet.jointBet) {
                    if (bet.participants[0].participants.indexOf(nickname) !== -1 || bet.participants[1].participants.indexOf(nickname) !== -1) {
                        totalNumberOfBets++;
                    }
                } else {
                    let userTrigger = false;
                    for (let i = 0; i < bet.participants.length; i++) {
                        if (bet.participants[i].name === nickname) {
                            userTrigger = true;
                            break;
                        }
                    }
                    if (userTrigger) {
                        totalNumberOfBets++;
                    }
                }
            })
        }
    })

    return { totalNumberOfBets, waitingNotifications };
}

export const isMobile = () => {
    if (window.innerWidth < 480) {
        return true;
    }
    else return false;
}

export const joinArrays = (oldArray, newArray) => {
    let uniqueArray = [];
    for (let i = 0; i < oldArray.length; i++) {
        let trigger = false;
        for (let j = 0; j < newArray.length; j++) {
            if (oldArray[i] === newArray[j]) {
                trigger = true;
            }
        }
        if (!trigger) {
            uniqueArray.push(oldArray[i]);
        }
    }

    return uniqueArray;
}

export const passwordCheck = (password) => {
    if (password.length < 6 && password.length > 16) {
        return false;
    }
    const regex = /^(?=.*\d).{6,16}$/;
    return regex.test(password);
}

export const removeGroup = (groups, ID) => {
    let newGroups = JSON.parse(JSON.stringify(groups));
    const changedGroups = newGroups.filter(group => group._id.toString() !== ID.toString());
    return changedGroups;
}

export const returnToMain = (props) => {
    window.scrollTo(0, 0);
    props.history.push('/');
}

export const rightUserCheck = (name, type, bet) => {
    let trigger = false;
    if (type === "regular") {
        bet.participants.forEach(item => {
            if (item.name === name) {
                trigger = true;
            }
        })
    }
    else if (type === "jointBet") {
        bet.participants[0].participants.forEach(item => {
            if (item === name) {
                trigger = true;
            }
        })
        bet.participants[1].participants.forEach(item => {
            if (item === name) {
                trigger = true;
            }
        })
    }
    return trigger;
}

export const windowWidth = (size) => {
    return window.screen.width > size;
}