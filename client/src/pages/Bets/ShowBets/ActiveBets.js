import React, { Component} from 'react';
import { connect } from 'react-redux';
import { changeGroup } from '../../../components/Groups/GroupsDropdown/ChangeGroupFunction';
import { finishBetRequest } from '../../../services/Axios/BetRequests';
import { changeSingleGroup, rightUserCheck } from '../../../services/HelperFunctions/HelperFunctions';
import {Link} from 'react-router-dom';
import BetLegend from '../../../components/ShowBets/BetLegend';
import ConfirmButton from '../../../components/Buttons/ConfirmButton';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import DifferentStakes from '../../../parts/Bets/DifferentStakes';
import JointBet from '../../../parts/Bets/JointBet';
import Loader from '../../../components/Loaders/Loader';
import SameStakes from '../../../parts/Bets/SameStakes';
import ShowBetsLayout from './ShowBetsLayout';
import SuccessModal from '../../../components/Modals/SuccessModal';
import './styles.scss';


class ActiveBets extends Component {
    state = {
        bets: [],
        editId: "",
        error: false,
        errorMessage: "",
        finishID: "",
        finishBetModal: false,
        groupsOpen: false,
        modalOpen: false,
        pageLoaded: false,
        success: false,
        successMessage: "",
        trigger: false,
        winner: ""
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        document.getElementById('root').style.height = "100%";
        document.body.style.overflowY = "auto";

        if (this.props.appLoaded) {
            if (this.props.user === "guest") {
                this.props.history.push('/');
            }

            if (this.props.groups.length > 0) {
                this.reRenderBets();
            } 
            
            else {
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

    chooseBetWinner = (e, name) => {
        e.stopPropagation()
        this.setState({ winner: name }, () => {
            this.reRenderBets();
        })
    }

    closeModals = (e) => {
        if (this.state.groupsOpen) {
            if (e.target.className.indexOf('all-bets-container') !== -1 || e.target.className.indexOf('upper-bet-container') !== -1) {
                this.setState({ groupsOpen: false })
            }
        }
        if (this.state.finishBetModal) {
            this.setState({ finishBetModal: false, finishID: "" }, () => {
                this.reRenderBets();
            })
        }
    }

    finishedBetToServer = (e, bet, id) => {
        e.stopPropagation();
        if (this.state.winner !== "") {
            document.body.style.pointerEvents = 'none';
            document.body.style.cursor = 'wait';
            const finishBetPromise = finishBetRequest('finishRequest', this.props.selectedGroup, bet, this.state.winner);
            finishBetPromise.then(groupResponse => {
                window.scrollTo(0, 0);
                const changedGroups = changeSingleGroup(this.props.groups, this.props.selectedGroup, groupResponse.data.payload);
                this.props.setGroups(changedGroups);
                this.setState({
                    finishID: "",
                    finishBetModal: false,
                    success: true,
                    successMessage: groupResponse.data.message,
                    winner: ""
                }, () => {
                    document.getElementById('success-modal-container').style.top = `${window.pageYOffset}px`;
                    setTimeout(() => {
                        document.body.style.pointerEvents = 'auto';
                        document.body.style.cursor = 'auto';
                        this.setState({ success: false, successMessage: "" })
                        this.reRenderBets();
                    }, 1000)
                })
            }).catch(err => {
                this.setState({
                    finishID: "",
                    finishBetModal: false,
                    error: true,
                    errorMessage: "Could not finish bet!"
                }, () => {
                    setTimeout(() => this.setState({ error: false, errorMessage: "" }), 1500)
                })
            })
        }
    }

    handleEdit = (id) => {
        this.props.history.push({
            pathname:'/add-bet',
            state:{
                editID: id,
                editMode:true,
                selectedGroup: this.props.selectedGroup,
                selectedGroupName: this.props.selectedGroupName
            }
        })
    }

    handleFinish = (e, id) => {
        e.stopPropagation();
        this.setState({
            finishBetModal: true,
            finishID: id
        }, () => {
            this.reRenderBets();
        })
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
        selectedGroup = selectedGroup[0].activeBets;

        bets = selectedGroup.map(bet => {
            if (bet.finished === false) {
                trigger = true;
                i++;
                if (bet.jointBet) {
                    return <JointBet
                        bet={bet}
                        chooseBetWinner={this.chooseBetWinner}
                        finishedBetToServer={this.finishedBetToServer}
                        finishID={this.state.finishID}
                        handleEdit={this.handleEdit}
                        handleFinish={this.handleFinish}
                        idx={i}
                        key={bet._id}
                        reDirect={this.reDirect}
                        rightUserCheck={rightUserCheck}
                        type={'active'}
                        winner={this.state.winner}
                        user={this.props.user}
                    />
                }
                else {
                    if (bet.differentStakes) {
                        return <DifferentStakes
                            bet={bet}
                            chooseBetWinner={this.chooseBetWinner}
                            finishedBetToServer={this.finishedBetToServer}
                            finishID={this.state.finishID}
                            handleFinish={this.handleFinish}
                            handleEdit={this.handleEdit}
                            idx={i}
                            key={bet._id}
                            reDirect={this.reDirect}
                            rightUserCheck={rightUserCheck}
                            type={'active'}
                            winner={this.state.winner}
                            user={this.props.user}
                        />
                    }

                    else {
                        return <SameStakes
                            bet={bet}
                            chooseBetWinner={this.chooseBetWinner}
                            finishedBetToServer={this.finishedBetToServer}
                            finishID={this.state.finishID}
                            handleFinish={this.handleFinish}
                            handleEdit={this.handleEdit}
                            idx={i}
                            key={bet._id}
                            reDirect={this.reDirect}
                            rightUserCheck={rightUserCheck}
                            type={'active'}
                            winner={this.state.winner}
                            user={this.props.user} />
                    }
                }
            }
            else {
                return false;
            }
        })
        this.setState({
            bets,
            error: false,
            errorMessage: "",
            trigger,
            pageLoaded: true,
            success: false,
            successMessage: "",
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
                    user={this.props.user}>
                    {this.state.trigger ? this.state.bets : 
                        <div className="no-bets-to-show basic-column-fx justify-center-fx align-center-fx">
                            <span>No active bets to show</span>
                            <Link to="/add-bet"><ConfirmButton classToDisplay="confirm-button-space" text="Add bet" type="button" /></Link>
                        </div>
                    }
                    <BetLegend />
                    {this.state.error ? <ErrorMessage classToDisplay="message-space" text={this.state.errorMessage} /> : null}
                    {this.state.success ? <SuccessModal message={this.state.successMessage} /> : null}
                </ShowBetsLayout>
            );
        } 
        
        else {
            return (
                <Loader loading={!this.state.pageLoaded || !this.props.appLoaded} />
            )
        }
    };
}

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

        setGroups: (groups) => {
            dispatch({ type: "groups/setGroups", payload: groups })
        },

        setGroupName: (name) => {
            dispatch({ type: "appStates/setGroupName", payload: name })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ActiveBets);

