import React, { Component } from 'react';
import { connect } from 'react-redux';
import { changeSingleGroup } from '../../services/HelperFunctions/HelperFunctions';
import { notificationRequests } from '../../services/Axios/OtherRequests';
import AddBetsHome from './AddBetsHome/AddBetsHome';
import BetApprovals from './BetApprovals/BetApprovals';
import GroupsHome from './Groups/GroupsHome';
import LatestBets from './LatestBets/LatestBets';
import Loader from '../../components/Loaders/Loader';
import Profile from '../../parts/Profile/Profile';
import NonAuthHome from '../Public/NonAuthHome/NonAuthHome';
import Notifications from '../../parts/Notifications/Notifications';
import ServerError from '../../components/ServerError/ServerError';
import StatsHome from './StatsHome/StatsHome';
import SuggestedBets from './SuggestedBets/SuggestedBets';
import ViewBets from './ViewBets/ViewBets';
import './styles.scss';

class Home extends Component {

    state = {
        accountModalOpen: false,
        error: false,
        errorMessage: "",
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
        selectedCategory: null,
        success: false,
        successMessage: "",
        showNotifications: false
    }

    componentDidMount() {
        document.getElementById('root').style.height = "100%";
        document.body.style.overflowY = "auto";
        window.scrollTo(0, 0);

        if (this.props.appLoaded && this.props.user !== "guest" && this.props.firstRead) {
            this.markAsSeen();
        }
    }

    componentDidUpdate() {
        if (this.props.appLoaded && this.props.user !== "guest" && this.props.firstRead) {
            this.markAsSeen();
        }
    }

    changeCategory = (e, name) => {
        e.stopPropagation();
        if(this.state.selectedCategory !== name){
            this.setState({selectedCategory: name});
        }

        else{
            this.setState({selectedCategory: ""});
        }
    }

    handleAccountModal = (e) => {
        e.stopPropagation();
        const newModalState = !this.state.accountModalOpen;
        this.setState({ accountModalOpen: newModalState });
    }

    handleAddBet = (e, info) => {
        e.stopPropagation();

        switch(info){
            case "solo":
            this.props.history.push({
                pathname:'/add-bet',
                state:{
                    type:"custom",
                    bet:"solo"
                }
            })
            break;

            case "group":
            this.props.history.push({
                pathname:'/add-bet',
                state:{
                    type:"custom",
                    bet:"group"
                }
            })
            break;

            default:
                return false;
        }
    }

    handleAddPopularBet = (e, whichBet) => {
       e.stopPropagation(); 
       this.props.history.push({
           pathname: '/add-bet',
           state:{
               type:"popular",
               subject:whichBet
           }
       })
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

    reDirect = (e, path) => {
        e.stopPropagation();
        this.props.history.push(path);
    }

    render() {
        if (this.props.appLoaded && this.props.user === "guest") {
            return (
                <div className="main-container gradient-background">
                    <NonAuthHome navNonAuth={this.state.navNonAuth} reDirect={this.reDirect} />
                </div>
            )
        } 
        
        else if(!this.props.appLoaded){
            return <Loader loading={this.props.appLoaded}/>
        } 
        
        else {
            return (
                <div className="main-container gradient-background basic-column-fx wrap-fx" onClick={this.hideAccountModal}>
                    {this.props.error ? <ServerError message={this.props.errorMessage} /> : null}
                    <div className="home-container basic-column-fx align-center-fx">
                        <div id="upper-home-container" className="basic-fx justify-around-fx align-center-fx">
                            <div id="left-home-container">
                                <div className="basic-column-fx align-center-fx">
                                    <span>{"Welcome back, "}</span>
                                    <span>{`${this.props.user.nickname}`}</span>
                                </div>
                            </div>
                            <div id="right-home-container" className="basic-fx justify-around-fx align-center-fx">
                                <Profile
                                    accountModalOpen={this.state.accountModalOpen}
                                    balance={this.props.shortStats.balance}
                                    handleAccountModal={this.handleAccountModal}
                                    hoverChangePicture={this.hoverChangePicture}
                                    imgSource={this.props.user.avatarLocation}
                                    menuClick={this.menuClick}
                                    navAuth={this.state.navAuth}
                                    reDirect={this.reDirect}
                                    totalNumberOfBets={this.props.shortStats.totalNumberOfBets}
                                    user={this.props.user}
                                />
                            </div>

                        </div>
                        <div id="middle-home-container" className="basic-fx wrap-fx justify-around-fx align-start-fx">
                            <Notifications handleShowNotifications={this.handleShowNotifications} handleNotificationApproval={this.handleNotificationApproval} showNotifications={this.state.showNotifications} user={this.props.user} />
                            <LatestBets appLoaded={this.props.appLoaded} latestBets={this.props.latestBets} reDirect={this.reDirect} user={this.props.user} />
                            {this.props.shortStats.waitingNotifications ? <BetApprovals reDirect={this.reDirect} /> : null}
                            <ViewBets />
                            <AddBetsHome handleAddBet={this.handleAddBet} />
                            <SuggestedBets changeCategory={this.changeCategory} handleAddPopularBet={this.handleAddPopularBet} popularBets={this.props.popularBets} selectedCategory={this.state.selectedCategory} />
                            <GroupsHome />
                            <StatsHome />
                        </div>
                    </div>
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
        latestBets: state.appStates.latestBets,
        popularBets:state.appStates.popularBets,
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