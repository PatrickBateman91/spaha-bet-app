import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { changeSingleGroup, windowWidth } from '../../../services/HelperFunctions/HelperFunctions';
import { notificationRequests } from '../../../services/Axios/OtherRequests';
import Profile from '../../../parts/Profile/Profile';
import ManageBets from '../../../parts/Menu/ManageBets';
import ManageGroups from '../../../parts/Menu/ManageGroups';
import NonAuthHome from '../../Public/Home/NonAuthHome';
import Notifications from '../../../parts/Notifications/Notifications';
import ServerError from '../../../components/ServerError/ServerError';
import SignOutNav from '../../../parts/Menu/SignOutNav';
import './styles.scss';

class Home extends Component {

    state = {
        accountModalOpen: false,
        error: false,
        errorMessage: "",
        editID: "",
        finishBetModal: false,
        finishID: "",
        hoverProfile: false,
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
        pageLoaded: false,
        payedModal: false,
        payedModalBet: "",
        people: [],
        success: false,
        successMessage: "",
        showNotifications: false,
        usingFilter: false
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        document.getElementById('root').style.height = "100%";
        document.body.style.overflowY = "auto";
        if (this.props.appLoaded && this.props.user !== "guest" && this.props.firstRead) {
            this.markAsSeen();
        }
    }

    componentDidUpdate() {
        if (this.props.appLoaded && this.props.user !== "guest" && this.props.firstRead) {
            this.markAsSeen();
        }
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
            approveNewMemberPromise.then(groupResponse => {
                let changedGroups = JSON.parse(JSON.stringify(this.props.groups));
                changedGroups = changeSingleGroup(this.props.groups, groupResponse.data.payload._id.toString(), groupResponse.data.payload);
                this.props.removeNotification(functionProps.notification._id.toString());
                this.props.setGroups(changedGroups);
            }).catch(err => {
                if (err.response.data.message === "Group is no longer available!") {
                    window.location.reload();
                }
                this.setState({
                    error: true,
                    errorMessage: "There was an error!"
                }, () => {
                    setTimeout(() => this.setState({ error: false, errorMessage: "" }), 1000)
                })
            })

        }
        else if (functionProps.notification.type === "pending group invite") {
            const pendingGroupInvitePromise = notificationRequests("accept group invite", functionProps.notification.data.groupId, answer, null, functionProps.notification._id)
            pendingGroupInvitePromise.then(groupResponse => {
                if (answer === "Accept") {
                    const changedGroups = JSON.parse(JSON.stringify(this.props.groups));
                    const newUserGroups = JSON.parse(JSON.stringify(this.props.user.groups));
                    changedGroups.push(groupResponse.data.payload)
                    newUserGroups.push(groupResponse.data.payload._id.toString());
                    this.props.removeNotification(functionProps.notification._id.toString());
                    this.props.setGroups(changedGroups);
                    this.props.updateUserGroups(newUserGroups);

                    this.setState({
                        success: true,
                        successMessage: `You joined ${groupResponse.data.payload.name}`
                    }, () => setTimeout(() => this.setState({ success: false, successMessage: "" }), 1500))
                }

                else if (answer === "Decline") {
                    this.props.removeNotification(functionProps.notification._id.toString());
                }

            }).catch(err => {
                if (err.response.data.message === "Group is no longer available!") {
                    window.location.reload();
                }
                this.setState({
                    error: true,
                    errorMessage: "There was an error!"
                }, () => {
                    setTimeout(() => this.setState({ error: false, errorMessage: "" }), 1000)
                })
            })
        }
    }

    handleNavigationClick = (e) => {
        this.props.history.push(`/${e.target.id}`);
    }

    handleShowNotifications = () => {
        const newValue = !this.state.showNotifications;
        this.setState({ showNotifications: newValue })
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
        this.props.setFirstRead(false);
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

    render() {
        if (this.props.appLoaded && this.props.user === "guest") {
            return (
                <div className="main-container gradient-background">
                    <NonAuthHome navNonAuth={this.state.navNonAuth} handleNavigationClick={this.handleNavigationClick} />
                </div>
            )
        } else {
            return (
                <div className="main-container main-background basic-column-fx wrap-fx" onClick={this.hideAccountModal}>
                    {this.props.error ? <ServerError message={this.props.errorMessage} /> : null}
                    {this.props.appLoaded ? <Fragment><div id="upper-home-container" className="basic-fx justify-around-fx">
                        <div id="left-home-container" className="basic-fx justify-around-fx align-center-fx">
                            <Profile
                                accountModalOpen={this.state.accountModalOpen}
                                balance={this.props.shortStats.balance}
                                handleAccountClick={this.handleAccountClick}
                                handleAccountModal={this.handleAccountModal}
                                handleNavigationClick={this.handleNavigationClick}
                                hoverChangePicture={this.hoverChangePicture}
                                imgSource={this.props.user.avatarLocation}
                                menuClick={this.menuClick}
                                navAuth={this.state.navAuth}
                                reDirect={this.reDirect}
                                totalNumberOfBets={this.props.shortStats.totalNumberOfBets}
                                user={this.props.user}
                            />
                        </div>
                        {this.props.appLoaded && this.props.user !== "guest" ? windowWidth(768) ? <div id="right-home-container" className='basic-fx align-center-fx justify-center-fx'>
                            <SignOutNav navAuth={this.state.navAuth} handleNavigationClick={this.handleNavigationClick} />
                        </div> : null : null}

                    </div>
                        <div id="middle-home-container" className="basic-fx justify-around-fx">
                            <Notifications handleShowNotifications={this.handleShowNotifications} handleNotificationApproval={this.handleNotificationApproval} showNotifications={this.state.showNotifications} user={this.props.user} />
                            <ManageBets menuClick={this.menuClick} notifications={this.props.shortStats.waitingNotifications} />
                            <ManageGroups menuClick={this.menuClick} />
                        </div>
                    </Fragment> : null
                    }
                </div>
            );
        }
    }
}

const mapStateToProps = (state) => {
    return {
        appLoaded: state.appStates.appLoaded,
        firstRead: state.appStates.firstRead,
        groups: state.groups,
        shortStats: state.appStates.shortStats,
        user: state.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        removeNotification: (id) => {
            dispatch({ type: 'user/removeNotification', payload: id })
        },

        setFirstRead: (bool) => {
            dispatch({ type: 'appStates/setFirstRead', payload: bool })
        },

        setGroups: (groups) => {
            dispatch({ type: 'groups/setGroups', payload: groups });
        },

        updateUserGroups: (groups) => {
            dispatch({ type: 'user/updateUserGroups', payload: groups });
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);