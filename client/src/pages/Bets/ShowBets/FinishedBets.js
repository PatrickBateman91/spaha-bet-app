import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { getUserData } from '../../../services/Axios/UserRequests';
import { rightUserCheck } from '../../../services/HelperFunctions/HelperFunctions';
import DifferentStakes from '../../../parts/Bets/DifferentStakes';
import JointBet from '../../../parts/Bets/JointBet';
import Loader from '../../../components/Loaders/Loader';
import SameStakes from '../../../parts/Bets/SameStakes';
import ShowBetsLayout from './ShowBetsLayout';
import './styles.scss';


class FinishedBets extends Component {
    state = {
        filteredData: [],
        filterTitle: "",
        groups: [],
        groupsOpen: false,
        pageLoaded: false,
        selectedGroup: "",
        selectedGroupName: "",
        usingFilter: false,
        user: undefined
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        const getUserPromise = getUserData('get user');
        getUserPromise.then(resUser => {
            const getDataPromise = getUserData('get groups')
            getDataPromise.then(resData => {
                if (resData.data !== "User is not a part of any groups!") {
                    this.setState({
                        groups: resData.data,
                        selectedGroup: resData.data[0]._id,
                        selectedGroupName: resData.data[0].name,
                        user: resUser.data
                    }, () => {
                        this.reRenderBets()
                    })
                } else {
                    this.setState({ pageLoaded: true })
                }


            }).catch(err => {
                this.props.history.push('/sign-in')
            })
        }).catch(err => {
            this.props.history.push('/sign-in')
        })
    }

    closeModals = (e) => {
        if (this.state.groupsOpen) {
            if (e.target.className.indexOf('all-bets-container') !== -1 || e.target.className.indexOf('upper-bet-container') !== -1) {
                this.setState({ groupsOpen: false })
            }
        }
    }

    getUserProfile = (e, name) => {
        this.props.history.push(`/profile/${name}`)
    }

    handleGroupChange = (e) => {
        if (e.target.innerHTML.indexOf("<") === -1) {
            let newName = e.target.innerHTML;
            const newGroup = this.state.groups.filter(group => group.name === newName);
            this.setState({
                filteredData: [],
                filterTitle: "",
                groupsOpen: false,
                selectedGroup: newGroup[0]._id,
                selectedGroupName: newGroup[0].name,
                usingFilter: false,
            }, () => {
                this.reRenderBets();
            })
        }
    }

    handleGroupModal = () => {
        this.setState({
            groupsOpen: true
        })
    }

    updateGroup = (selectedGroup, newGroup) => {
        this.setState({
            groups: newGroup,
            selectedGroup: selectedGroup[0]._id,
            selectedGroupName: selectedGroup[0].name,
            user: this.state.user
        }, () => {
            this.reRenderBets()
        })
    }

    reRenderBets() {
        let i = 0;
        let trigger;
        let bets;
        let selectedGroup = this.state.groups.filter(group => group._id === this.state.selectedGroup);
        selectedGroup = selectedGroup[0].finishedBets;

        bets = selectedGroup.map(bet => {

            trigger = true;
            i++;
            if (bet.jointBet) {
                return <JointBet
                    bet={bet}
                    getUserProfile={this.getUserProfile}
                    idx={i}
                    key={bet._id}
                    rightUserCheck={rightUserCheck}
                    type={'finished'}
                    winner={bet.winner}
                    user={this.state.user}
                />
            }
            else {
                if (bet.differentStakes) {
                    return <DifferentStakes
                        bet={bet}
                        getUserProfile={this.getUserProfile}
                        idx={i}
                        key={bet._id}
                        rightUserCheck={rightUserCheck}
                        type={'finished'}
                        winner={bet.winner}
                        user={this.state.user}
                    />
                }

                else {
                    return <SameStakes
                        bet={bet}
                        getUserProfile={this.getUserProfile}
                        idx={i}
                        key={bet._id}
                        rightUserCheck={rightUserCheck}
                        type={'finished'}
                        winner={bet.winner}
                        user={this.state.user} />
                }
            }
        })
        this.setState({
            bets,
            trigger,
            pageLoaded: true
        })
    }

    render() {
        if (this.state.pageLoaded) {
            return (
                <ShowBetsLayout
                    bets={this.state.bets}
                    closeModals={this.closeModals}
                    groups={this.state.groups}
                    groupsOpen={this.state.groupsOpen}
                    handleGroupModal={this.handleGroupModal}
                    handleGroupChange={this.handleGroupChange}
                    pageLoaded={this.state.pageLoaded}
                    selectedGroup={this.state.selectedGroup}
                    selectedGroupName={this.state.selectedGroupName}
                    trigger={this.state.trigger}
                    user={this.props.user}
                >
                    {this.state.trigger ? this.state.bets : <div className="no-bets-to-show">No finished bets to show</div>}
                    <div id="legend-finished-bets">
                        <div><span>Winner</span><FontAwesomeIcon icon={faCheck} /></div>
                    </div>
                </ShowBetsLayout>
            )
        } else {
            return (
                <Loader loading={!this.state.pageLoaded} />
            )
        }
    }
};

export default FinishedBets;