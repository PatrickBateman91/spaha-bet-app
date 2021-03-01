import React, { Component } from 'react';
import { connect } from 'react-redux';
import { changeGroup } from '../../../components/Groups/GroupsDropdown/ChangeGroupFunction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { rightUserCheck } from '../../../services/HelperFunctions/HelperFunctions';
import DifferentStakes from '../../../parts/Bets/DifferentStakes';
import JointBet from '../../../parts/Bets/JointBet';
import Loader from '../../../components/Loaders/Loader';
import SameStakes from '../../../parts/Bets/SameStakes';
import ShowBetsLayout from './ShowBetsLayout';
import './styles.scss';


class FinishedBets extends Component {
    state = {
        groupsOpen: false,
        pageLoaded: false,
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        document.getElementById('root').style.height = "100%";

        if (this.props.appLoaded) {
            if (this.props.user === "guest") {
                this.props.history.push('/');
            }

            if (this.props.groups.length > 0) {
                this.reRenderBets();
            } else {
                this.setState({ pageLoaded: true })
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.appLoaded && this.props.appLoaded) {
            if (this.props.user === "guest") {
                this.props.history.push('/');
            } else {
                if (this.props.groups.length > 0) {
                    this.reRenderBets();
                } else {
                    this.setState({ pageLoaded: true })
                }
            }
        }
    }

    closeModals = (e) => {
        if (this.state.groupsOpen) {
            if (e.target.className.indexOf('all-bets-container') !== -1 || e.target.className.indexOf('upper-bet-container') !== -1) {
                this.setState({ groupsOpen: false })
            }
        }
    }

    handleGroupChange = (ID, e) => {
        e.stopPropagation();
        changeGroup(this.props.groups, ID, this.props.setGroup, this.props.setGroupName);
        this.setState({
            groupsOpen: false,
        }, () => {
            this.reRenderBets();
        })
    }

    handleGroupModal = (e) => {
        e.stopPropagation();
        this.setState({
            groupsOpen: true
        })
    }

    reRenderBets() {
        let i = 0;
        let trigger;
        let bets;
        let selectedGroup = this.props.groups.filter(group => group._id === this.props.selectedGroup);
        selectedGroup = selectedGroup[0].finishedBets;

        bets = selectedGroup.map(bet => {

            trigger = true;
            i++;
            if (bet.jointBet) {
                return <JointBet
                    bet={bet}
                    idx={i}
                    key={bet._id}
                    reDirect={this.reDirect}
                    rightUserCheck={rightUserCheck}
                    type={'finished'}
                    winner={bet.winner}
                    user={this.props.user}
                />
            }
            else {
                if (bet.differentStakes) {
                    return <DifferentStakes
                        bet={bet}
                        idx={i}
                        key={bet._id}
                        reDirect={this.reDirect}
                        rightUserCheck={rightUserCheck}
                        type={'finished'}
                        winner={bet.winner}
                        user={this.props.user}
                    />
                }

                else {
                    return <SameStakes
                        bet={bet}
                        idx={i}
                        key={bet._id}
                        reDirect={this.reDirect}
                        rightUserCheck={rightUserCheck}
                        type={'finished'}
                        winner={bet.winner}
                        user={this.props.user} />
                }
            }
        })
        this.setState({
            bets,
            trigger,
            pageLoaded: true
        })
    }

    reDirect = (e, path) => {
        e.stopPropagation();
        this.props.history.push(path)
    }

    render() {
        if (this.state.pageLoaded) {
            return (
                <ShowBetsLayout
                    bets={this.state.bets}
                    closeModals={this.closeModals}
                    groups={this.props.groups}
                    groupsOpen={this.state.groupsOpen}
                    handleGroupModal={this.handleGroupModal}
                    handleGroupChange={this.handleGroupChange}
                    pageLoaded={this.state.pageLoaded}
                    selectedGroup={this.props.selectedGroup}
                    selectedGroupName={this.props.selectedGroupName}
                    trigger={this.state.trigger}
                    user={this.props.user}
                >
                    {this.state.trigger ? this.state.bets : <div className="no-bets-to-show basic-fx justify-center-fx align-center-fx"><span>No finished bets to show</span></div>}
                    <div id="legend-finished-bets">
                        <div><span>Winner</span><FontAwesomeIcon icon={faCheck} /></div>
                    </div>
                </ShowBetsLayout>
            )
        } else {
            return (
                <Loader loading={!this.state.pageLoaded || !this.state.appLoaded} />
            )
        }
    }
};


const mapStateToProps = (state) => {
    return {
        appLoaded: state.appStates.appLoaded,
        groups: state.groups,
        selectedGroup: state.appStates.selectedGroup,
        selectedGroupName: state.appStates.selectedGroupName,
        user: state.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setGroup: (id) => {
            dispatch({ type: "appStates/setGroup", payload: id })
        },
        setGroupName: (name) => {
            dispatch({ type: "appStates/setGroupName", payload: name })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FinishedBets);