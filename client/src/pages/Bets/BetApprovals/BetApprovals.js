import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { calculateBalance, changeSingleGroup, getShortStats, returnToMain, rightUserCheck } from '../../../services/HelperFunctions/HelperFunctions';
import { uploadApprovalRequest } from '../../../services/Axios/BetRequests';
import ApproveBox from '../../../components/ApproveBox/ApproveBox';
import DifferentStakes from '../../../parts/Bets/DifferentStakes';
import JointBet from '../../../parts/Bets/JointBet';
import Loader from '../../../components/Loaders/Loader';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import SameStakes from '../../../parts/Bets/SameStakes';
import SuccessModal from '../../../components/Modals/SuccessModal';
import './styles.scss';

class WaitingForApproval extends Component {
    state = {
        appLoading: true,
        error: false,
        errorMessage: "",
        pageLoaded: false,
        success: false,
        successMessage: ""
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        document.getElementById('root').style.height = "100%";
        if (this.props.appLoaded) {
            this.updateData(this.props.groups, this.props.user.nickname);
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.appLoaded && this.props.appLoaded) {
            if (this.props.user === "guest") {
                this.props.history.push('/');
            } else {
                this.updateData();
            }
        }
        if (this.props.needsUpdate) {
            let statsObject = getShortStats(this.props.groups, this.props.user.nickname);
            statsObject.balance = calculateBalance(this.props.groups, this.props.user.nickname);
            this.props.setShortStats(statsObject);
            this.updateData();
            this.props.setNeedsUpdate(false);
        }
    }

    getUserProfile = (e, name) => {
        this.props.history.push(`/profile/${name}`)
    }

    handleApproval = (e, functionProps, answer) => {
        e.stopPropagation();
        const divs = document.querySelector('.all-bets-container div');
        divs.style.pointerEvents = "none";
        document.body.style.cursor = "wait";

        const approvalPromise = uploadApprovalRequest(functionProps.requestType, functionProps.bet, functionProps.groupID, answer);
        approvalPromise.then(groupResponse => {
            document.body.style.pointerEvents = 'none';
            document.body.style.cursor = 'wait';
            let message = "";
            if (answer === "Accept") {
                message = "You approved the bet!"
            }
            else {
                message = "You declined the bet!"
            }
            this.setState({
                success: true,
                successMessage: message
            }, () => {
                document.getElementById('success-modal-container').style.top = `${window.pageYOffset}px`;
            });

            const changedGroups = changeSingleGroup(this.props.groups, functionProps.groupID, groupResponse.data.payload);
            this.props.setGroups(changedGroups);

            setTimeout(() => {
                this.props.setNeedsUpdate(true);
                document.body.style.pointerEvents = 'auto';
                document.body.style.cursor = 'auto';
                this.setState({ success: false, successMessage: "" });
            }, 1000)
        }).catch(err => {
            this.setState({
                error: true,
                errorMessage: err.response.data.message
            })
        })
    }

    updateData = () => {
        let addBets = [];
        let editBets = [];
        let finishBets = [];
        this.props.groups.forEach(group => {
            group.betsWaitingForAddApproval.forEach(bet => {
                if (bet.approvedAddArray.indexOf(this.props.user.nickname) === -1) {
                    let userCheck;
                    if (bet.jointBet) {
                        userCheck = rightUserCheck(this.props.user.nickname, "jointBet", bet);
                    }
                    else {
                        userCheck = rightUserCheck(this.props.user.nickname, "regular", bet);
                    }
                    if (userCheck) {
                        addBets.push({
                            bet: bet,
                            groupId: group._id
                        });
                    }
                }
            })
            group.betsWaitingForEditApproval.forEach(bet => {
                if (bet.approvedEditArray.indexOf(this.props.user.nickname) === -1) {
                    let userCheck;
                    if (bet.jointBet) {
                        userCheck = rightUserCheck(this.props.user.nickname, "jointBet", bet);
                    }
                    else {
                        userCheck = rightUserCheck(this.props.user.nickname, "regular", bet);
                    }
                    if (userCheck) {
                        editBets.push({
                            bet: bet,
                            groupId: group._id
                        });
                    }
                }
            })
            group.betsWaitingForFinishedApproval.forEach(bet => {
                if (bet.approvedFinishArray.indexOf(this.props.user.nickname) === -1) {
                    let userCheck;
                    if (bet.jointBet) {
                        userCheck = rightUserCheck(this.props.user.nickname, "jointBet", bet);
                    }
                    else {
                        userCheck = rightUserCheck(this.props.user.nickname, "regular", bet);
                    }
                    if (userCheck) {
                        finishBets.push({
                            bet: bet,
                            groupId: group._id
                        });
                    }
                }
            })
        })
        this.setState({
            appLoading: false,
            addBets,
            editBets,
            error: false,
            errorMessage: "",
            finishBets,
            pageLoaded: true,
            success: false,
            successMessage: ""
        }, () => {
            const divs = document.querySelector('.all-bets-container div');
            divs.style.pointerEvents = "auto";
            document.body.style.cursor = "auto";
        })
    }

    render() {
        let addBets = [];
        let editBets = [];
        let finishBets = [];
        let addTrigger = false;
        let editTrigger = false;
        let finishTrigger = false;
        if (this.state.pageLoaded) {
            addBets = this.state.addBets.map(add => {
                if (add.bet.jointBet) {
                    addTrigger = true;
                    return <Fragment key={add.bet._id}>
                        <JointBet
                            bet={add.bet}
                            getUserProfile={this.getUserProfile}
                            rightUserCheck={rightUserCheck}
                            type='approve-add'
                            user={this.props.user}
                        />
                        <ApproveBox handleApproval={this.handleApproval} bet={add.bet._id} groupID={add.groupId} requestType="add" />
                    </Fragment>
                }
                else {
                    addTrigger = true;
                    if (add.bet.differentStakes) {
                        return <Fragment key={add.bet._id}>
                            <DifferentStakes
                                bet={add.bet}
                                getUserProfile={this.getUserProfile}
                                rightUserCheck={rightUserCheck}
                                type='approve-add'
                                user={this.props.user}
                            />
                            <ApproveBox handleApproval={this.handleApproval} bet={add.bet._id} groupID={add.groupId} requestType="add" />
                        </Fragment>
                    }

                    else {
                        return <Fragment key={add.bet._id}>
                            <SameStakes
                                bet={add.bet}
                                getUserProfile={this.getUserProfile}
                                rightUserCheck={rightUserCheck}
                                type='approve-add'
                                user={this.props.user} />
                            <ApproveBox handleApproval={this.handleApproval} bet={add.bet._id} groupID={add.groupId} requestType="add" />
                        </Fragment>
                    }
                }
            })
            editBets = this.state.editBets.map(edit => {
                if (edit.bet.jointBet) {
                    editTrigger = true;
                    return <Fragment key={edit.bet._id}>
                        <JointBet
                            bet={edit.bet}
                            getUserProfile={this.getUserProfile}
                            rightUserCheck={rightUserCheck}
                            type='approve-edit'
                            user={this.props.user}
                        />
                        <ApproveBox handleApproval={this.handleApproval} bet={edit.bet._id} groupID={edit.groupId} requestType="edit" />
                    </Fragment>
                }
                else {
                    editTrigger = true;
                    if (edit.bet.differentStakes) {
                        return <Fragment key={edit.bet._id}>
                            <DifferentStakes
                                bet={edit.bet}
                                getUserProfile={this.getUserProfile}
                                rightUserCheck={rightUserCheck}
                                type='approve-edit'
                                user={this.props.user}
                            />
                            <ApproveBox handleApproval={this.handleApproval} bet={edit.bet._id} groupID={edit.groupId} requestType="edit" />
                        </Fragment>
                    }

                    else {
                        return <Fragment key={edit.bet._id}>
                            <SameStakes
                                bet={edit.bet}
                                getUserProfile={this.getUserProfile}
                                rightUserCheck={rightUserCheck}
                                type='approve-edit'
                                user={this.props.user} />
                            <ApproveBox handleApproval={this.handleApproval} bet={edit.bet._id} groupID={edit.groupId} requestType="edit" />
                        </Fragment>
                    }
                }
            })
            finishBets = this.state.finishBets.map(finish => {
                if (finish.bet.jointBet) {
                    finishTrigger = true;
                    return <Fragment key={finish.bet._id}>
                        <JointBet
                            bet={finish.bet}
                            getUserProfile={this.getUserProfile}
                            rightUserCheck={rightUserCheck}
                            type='approve-finish'
                            user={this.props.user}
                        />
                        <ApproveBox handleApproval={this.handleApproval} bet={finish.bet._id} groupID={finish.groupId} requestType="finish" />
                    </Fragment>
                }
                else {
                    finishTrigger = true;
                    if (finish.bet.differentStakes) {
                        return <Fragment key={finish.bet._id}>
                            <DifferentStakes
                                bet={finish.bet}
                                getUserProfile={this.getUserProfile}
                                rightUserCheck={rightUserCheck}
                                type={'approve-finish'}
                                user={this.props.user}
                            />
                            <ApproveBox handleApproval={this.handleApproval} bet={finish.bet._id} groupID={finish.groupId} requestType="finish" />
                        </Fragment>
                    }

                    else {
                        return <Fragment key={finish.bet._id}>
                            <SameStakes
                                bet={finish.bet}
                                getUserProfile={this.getUserProfile}
                                rightUserCheck={rightUserCheck}
                                type='approve-finish'
                                user={this.props.user} />
                            <ApproveBox handleApproval={this.handleApproval} bet={finish.bet._id} groupID={finish.groupId} requestType="finish" />
                        </Fragment>
                    }
                }
            })
        }
        return (
            <Fragment>
                <div className="all-bets-container basic-column-fx wrap-fx align-center-fx">
                    {!this.props.appLoaded ? <Loader loading={!this.props.appLoaded} /> : !addTrigger && !editTrigger && !finishTrigger ?
                        <div id="no-waiting-bets-container" className="basic-column-fx justify-evenly-fx">
                            <div id="no-waiting-bets-holder" className="basic-fx justify-evenly-fx">
                                You approved everything!
                        <FontAwesomeIcon
                                    icon={faCheck} />
                            </div>
                            <ReturnButton
                                classToDisplay="justify-center-fx return-button-medium"
                                returnToMain={returnToMain.bind(null, this.props)}
                                text="Main menu" />
                        </div>
                        :
                        <div className="basic-column-fx justify-around-fx">
                            <div className="approve-single-box basic-column-fx">
                                <span className="approve-item-title">Added bets</span>
                                {addTrigger ? addBets : <span className="approve-item">No added bets that are awaiting your approval!</span>}
                            </div>
                            <div className="approve-single-box basic-column-fx">
                                <span className="approve-item-title">Edited bets</span>
                                {editTrigger ? editBets : <span className="approve-item">No edited bets are awaiting your approval!</span>}
                            </div>

                            <div className="approve-single-box basic-column-fx">
                                <span className="approve-item-title">Finished bets</span>
                                {finishTrigger ? finishBets : <span className="approve-item">No finished bets are awaiting your approval!</span>}
                            </div>
                            <ReturnButton
                                classToDisplay="justify-center-fx return-button-space return-button-medium"
                                returnToMain={returnToMain.bind(null, this.props)}
                                text="Main menu" />
                        </div>}
                </div>
                {this.state.success ? <SuccessModal message={this.state.successMessage} /> : null}
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        appLoaded: state.appStates.appLoaded,
        groups: state.groups,
        needsUpdate: state.appStates.needsUpdate,
        shortStats: state.appStates.shortStats,
        user: state.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setAppLoaded: (bool) => {
            dispatch({ type: "appStates/setAppLoaded", payload: bool })
        },

        setGroups: (groups) => {
            dispatch({ type: "groups/setGroups", payload: groups })
        },

        setNeedsUpdate: (bool) => {
            dispatch({ type: "appStates/setNeedsUpdate", payload: bool })
        },

        setShortStats: (stats) => {
            dispatch({ type: "appStates/setShortStats", payload: stats })
        }

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WaitingForApproval);