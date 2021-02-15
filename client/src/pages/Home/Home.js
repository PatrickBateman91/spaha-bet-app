import React, { Component, Fragment } from 'react';
import { calculateBalance, getDate, windowWidth } from '../../services/HelperFunctions/HelperFunctions';
import { getUserData } from '../../services/Axios/UserRequests';
import { notificationRequests } from '../../services/Axios/OtherRequests';
import Profile from '../../parts/Profile/Profile';
import ManageBets from '../../parts/Menu/ManageBets';
import ManageGroups from '../../parts/Menu/ManageGroups';
import NonAuthHome from '../Public/Home/NonAuthHome';
import Notifications from '../../parts/Notifications/Notifications';
import SignOutNav from '../../parts/Menu/SignOutNav';
import './styles.scss';

class Home extends Component {

    state = {
        people: [],
        user: null,
        groups: [],
        navAuth: [
            {
                name: 'Sign Out',
                id: 'sign-out'
            }
        ],
        navNonAuth: [{
            name: 'Sign In',
            id: 'sign-in'
        }, {
            name: 'Sign Up',
            id: 'sign-up'
        }],
        accountModalOpen: false,
        error: false,
        errorMessage: "",
        editID: "",
        finishBetModal: false,
        finishID: "",
        filteredData: [],
        filterState: "",
        filterName: "",
        filterTitle: "",
        hoverProfile: false,
        pageLoaded: false,
        payedModal: false,
        payedModalBet: "",
        selectedGroup: "default",
        selectedGroupName: "",
        success: false,
        successMessage: "",
        usingFilter: false
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        document.getElementById('root').style.height = "100%";
        this.getUser(true, this.readDataFromServer);
    }

    getUser = (callbackB, callbackF) => {
        const getUserPromise = getUserData('get user');
        getUserPromise.then(resUser => {
            this.setState({
                user: resUser.data
            }, () => {
                if (callbackB) {
                    callbackF(true);
                }
            })
        })
            .catch(err => {
                this.setState({
                    pageLoaded: true
                })
            })
    }

    handleAccountClick = (e) => {
        e.stopPropagation();
        switch (e.target.innerHTML) {
            case "Change profile picture":
                this.props.history.push({
                    pathname: `/change-profile-picture`
                })
                break;

            case "Change account details":
                this.props.history.push({
                    pathname: `/change-account-details`
                })
                break;

            case "Deactivate the account":
                this.props.history.push({
                    pathname: `/deactivate-account`
                })
                break;

            default:
                return false;
        }
    }

    handleAccountModal = (e) => {
        e.stopPropagation();
        let newModalState = !this.state.accountModalOpen;
        this.setState({ accountModalOpen: newModalState });
    }

    handleNotificationApproval = (e, functionProps) => {
        e.stopPropagation();
        const answer = e.target.innerHTML;
        if (functionProps.notification.type === "accept user to group") {
            const approveNewMemberPromise = notificationRequests("accept user to group", functionProps.notification.data.groupId, answer, functionProps.notification.data.user, functionProps.notification._id);
            approveNewMemberPromise.then(res => {
                this.getUser(false, null);
            }).catch(err => {
                this.setState({
                    error: true,
                    errorMessage: "There was an error!"
                })
            })

        }
        else if ("pending group invite") {
            const pendingGroupInvitePromise = notificationRequests("accept group invite", functionProps.notification.data.groupId, answer, null, functionProps.notification._id)
            pendingGroupInvitePromise.then(res => {
                this.getUser(false, null);
            }).catch(err => {
                this.setState({
                    error: true,
                    errorMessage: "There was an error!"
                })
            })
        }
    }

    handleNavigationClick = (e) => {
        this.props.history.push(`/${e.target.id}`);
    }

    hideAccountModal = () => {
        this.setState({ accountModalOpen: false });
    }

    hoverChangePicture = (e) => {
        let defaultProfileTrigger = false;
        if (e.type === "mouseenter") {
        }
        if (e.target.nodeName === "IMG" && e.type === "mouseenter") {
            if (e.target.src.indexOf('default-profile') !== -1) {
                defaultProfileTrigger = true;
            }
        }

        const currentState = !this.state.hoverProfile;
        if (currentState) {
            document.getElementById("profile-picture-hidden-div").classList.remove('display-none');
        } else {
            document.getElementById('profile-picture-hidden-div').classList.add('display-none');
        }
        this.setState({
            hoverProfile: currentState
        }, () => {
            if (defaultProfileTrigger) {
                document.getElementById('profile-picture-hidden-div').style.borderRadius = "50%";
            } else {
                document.getElementById('profile-picture-hidden-div').style.borderRadius = "0%";
            }
        })

    }

    markAsSeen = () => {
        notificationRequests("read notifications");
    }

    menuClick = (e) => {
        e.stopPropagation();
        let whereTo;
        if (e.target.id === "approve-bets" || e.target.id === "approve-bets-container") {
            whereTo = "Approve bets";
        }

        else if (e.target.nodeName === "IMG") {
            whereTo = e.target.parentNode.childNodes[0].innerHTML;
        }

        else if (e.target.innerHTML === "More stats") {
            whereTo = e.target.innerHTML;
        }

        else if (e.target.nodeName === "SPAN") {
            whereTo = e.target.innerHTML;
        }

        else {
            let removeSpan = e.target.innerHTML.replace('<span>', "").replace('</span>', "")
            whereTo = removeSpan;
        }

        const reDirect = (path) => {
            this.props.history.push({
                pathname: `/${path}`
            })
        }
        switch (whereTo) {
            case "stats":
                return false;

            case "Add new bet":
                reDirect("add-bet");
                break;

            case "Create new group":
                reDirect("create-new-group");
                break;

            case "Join existing group":
                reDirect("join-new-group");
                break;

            case "View all active bets":
                reDirect("active-bets");
                break;

            case "View all finished bets":
                reDirect("finished-bets");
                break;

            case "Approve bets":
                reDirect("bet-approvals");
                break;

            case "More stats":
                reDirect('stats');
                break;

            case "Manage your groups":
                reDirect('manage-groups');
                break;

            default:
                if (whereTo.startsWith("Approve bets")) {
                    reDirect('bet-approvals');
                } else {
                    return false;
                }
        }
    }

    reDirect = () => {
        window.scrollTo(0, 0);
        this.props.history.push('/change-profile-picture')
    }

    readDataFromServer = (firstRead) => {
        const getDataPromise = getUserData('get groups');
        const nickname = this.state.user.nickname;
        let totalNumberOfBets = 0;
        getDataPromise.then(resData => {
            if (resData.data === "User is not a part of any groups!") {
                this.setState({
                    balance: 0,
                    groups: [],
                    selectedGroup: "",
                    selectedGroupName: "",
                    pageLoaded: true,
                    totalNumberOfBets: 0,
                    waitingNotifications: 0
                }, () => {
                    if (firstRead) {
                        this.markAsSeen();
                    }
                })
            }
            else {
                let waitingNotifications = 0;
                resData.data.forEach(group => {
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

                const balance = calculateBalance(resData.data, this.state.user.nickname);
                this.setState({
                    balance,
                    groups: resData.data,
                    selectedGroup: resData.data[0]._id,
                    selectedGroupName: resData.data[0].name,
                    pageLoaded: true,
                    totalNumberOfBets: totalNumberOfBets,
                    waitingNotifications
                }, () => {
                    if (firstRead) {
                        this.markAsSeen();
                    }
                })
            }

        }).catch(err => {
            console.log("Read data error");
        })
    }

    uploadBetToFirebase = (type, editId, newBet) => {
        let trigger = false;
        let copyState = [...this.state.people];
        if (newBet.jointBet) {
            newBet.participants.forEach(item => {
                item.participants.forEach(participant => {
                    let checkForNewName = this.state.people.indexOf(participant)
                    if (checkForNewName === -1) {
                        trigger = true;
                        copyState.push(participant);
                    }
                })
            })

            if (trigger) {

            }

            if (type) {
                let theOne = this.state.groups.filter(bet => {
                    return bet.id === editId;
                })

                let changes;
                if (theOne[0].newBet.changes) {
                    changes = [...theOne[0].newBet.changes]
                }
                else {
                    changes = [];
                }
                let name = "";
                let newDate = getDate(2);
                changes.push({ name: name, time: newDate })
                newBet.changes = changes;
            }
            else {
            }
        }

        else {
            newBet.participants.forEach(participant => {
                let checkForNewName = this.state.people.indexOf(participant.name)
                if (checkForNewName === -1) {
                    trigger = true;
                    copyState.push(participant.name)
                }
            })

            if (trigger) {
            }

            if (type) {
                let theOne = this.state.groups.filter(bet => {
                    return bet.id === editId;
                })

                let changes;
                if (theOne[0].newBet.changes) {
                    changes = [...theOne[0].newBet.changes]
                }
                else {
                    changes = [];
                }

                let name = "";
                let newDate = getDate(2);
                changes.push({ name: name, time: newDate })
                newBet.changes = changes;
            }
            else {
            }
        }
    }

    render() {
        return (
            <div className="main-container main-background basic-column-fx wrap-fx" onClick={this.hideAccountModal}>
                {this.state.pageLoaded && !this.state.user ?
                    <NonAuthHome navNonAuth={this.state.navNonAuth} handleNavigationClick={this.handleNavigationClick} /> :
                    this.state.pageLoaded ? <Fragment><div id="upper-home-container" className="basic-fx justify-around-fx">
                        <div id="left-home-container" className="basic-fx justify-around-fx align-center-fx">
                            <Profile
                                accountModalOpen={this.state.accountModalOpen}
                                balance={this.state.balance}
                                handleAccountClick={this.handleAccountClick}
                                handleAccountModal={this.handleAccountModal}
                                handleNavigationClick={this.handleNavigationClick}
                                hoverChangePicture={this.hoverChangePicture}
                                imgSource={this.state.user.avatarLocation}
                                menuClick={this.menuClick}
                                navAuth={this.state.navAuth}
                                reDirect={this.reDirect}
                                totalNumberOfBets={this.state.totalNumberOfBets}
                                user={this.state.user}
                            />
                        </div>
                        <div id="right-home-container" className="basic-fx align-center-fx justify-center-fx">
                            {this.state.pageLoaded && this.state.user ? windowWidth(480) ? <SignOutNav navAuth={this.state.navAuth} handleNavigationClick={this.handleNavigationClick} /> : null : null}
                        </div>
                    </div>
                        <div id="middle-home-container" className="basic-fx justify-around-fx">
                            <Notifications user={this.state.user} handleNotificationApproval={this.handleNotificationApproval} />
                            <ManageBets menuClick={this.menuClick} notifications={this.state.waitingNotifications} />
                            <ManageGroups menuClick={this.menuClick} />
                        </div>
                    </Fragment> : null
                }
            </div>
        );
    }
}

export default Home;