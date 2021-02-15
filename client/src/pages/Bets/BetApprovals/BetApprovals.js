import React, { Component, Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { getUserData } from '../../../services/Axios/UserRequests';
import { returnToMain, rightUserCheck } from '../../../services/HelperFunctions/HelperFunctions';
import { uploadApprovalRequest } from '../../../services/Axios/BetRequests';
import ApproveBox from '../../../components/ApproveBox/ApproveBox';
import DifferentStakes from '../../../parts/Bets/DifferentStakes';
import JointBet from '../../../parts/Bets/JointBet';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import SameStakes from '../../../parts/Bets/SameStakes';
import './styles.scss';

class WaitingForApproval extends Component {
    state = {
        pageLoaded: false,
        error: false,
        errorMessage: "",
        success: false,
        successMessage: ""
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        this.readDataFromServer();
    }

    getUserProfile = (e, name) => {
        this.props.history.push(`/profile/${name}`)
    }

    handleApproval = (e, functionProps) => {
        e.stopPropagation();
        const divs = document.querySelector('.all-bets-container div');
        divs.style.pointerEvents = "none";
        document.body.style.cursor = "wait";

        const answer = e.target.innerHTML;
        const approvalPromise = uploadApprovalRequest(functionProps.requestType, functionProps.bet, functionProps.groupId, answer);
        approvalPromise.then(res => {
            let message = "";
            if (answer === "Accept") {
                message = "You approved the bet!"
            }
            else {
                message = "You declined bet!"
            }
            this.setState({
                success: true,
                successMessage: message
            }, () => {
                setTimeout(() => {
                    this.readDataFromServer();
                }, 1000)
            })
        }).catch(err => {
            this.setState({
                error: true,
                errorMessage: "Oops. Something went wrong!"
            })
        })

    }

    updateData = (updateData, updateNickname, updateUser) => {
        let addBets = [];
        let editBets = [];
        let finishBets = [];
        updateData.forEach(group => {
            group.betsWaitingForAddApproval.forEach(bet => {
                if (bet.approvedAddArray.indexOf(updateNickname) === -1) {
                    let userCheck;
                    if (bet.jointBet) {
                        userCheck = rightUserCheck(updateNickname, "jointBet", bet);
                    }
                    else {
                        userCheck = rightUserCheck(updateNickname, "regular", bet);
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
                if (bet.approvedEditArray.indexOf(updateNickname) === -1) {
                    let userCheck;
                    if (bet.jointBet) {
                        userCheck = rightUserCheck(updateNickname, "jointBet", bet);
                    }
                    else {
                        userCheck = rightUserCheck(updateNickname, "regular", bet);
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
                if (bet.approvedFinishArray.indexOf(updateNickname) === -1) {
                    let userCheck;
                    if (bet.jointBet) {
                        userCheck = rightUserCheck(updateNickname, "jointBet", bet);
                    }
                    else {
                        userCheck = rightUserCheck(updateNickname, "regular", bet);
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
            addBets,
            editBets,
            error: false,
            errorMessage: "",
            finishBets,
            pageLoaded: true,
            success: false,
            successMessage: "",
            user: updateUser
        }, () => {
            const divs = document.querySelector('.all-bets-container div');
            divs.style.pointerEvents = "auto";
            document.body.style.cursor = "auto";
        })
    }

    readDataFromServer = () => {
        const getUserPromise = getUserData('get user');
        getUserPromise.then(resUser => {
            const getDataPromise = getUserData('get groups')
            getDataPromise.then(resData => {
                this.updateData(resData.data, resUser.data.nickname, resUser.data);
            }).catch(err => {
                this.setState({
                    error: true,
                    errorMessage: "Could not get data!"
                })
            })
        }).catch(err => {
            this.setState({
                error: true,
                errorMessage: "Could not get user"
            })
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
                            finishedBetToServer={this.finishedBetToServer}
                            filterUserBets={this.filterUserBets}
                            getUserProfile={this.getUserProfile}
                            handleEdit={this.handleEdit}
                            rightUserCheck={rightUserCheck}
                            type={'approve-add'}
                            user={this.state.user}
                        />
                        <ApproveBox handleApproval={this.handleApproval} bet={add.bet._id} groupId={add.groupId} requestType="add" />
                    </Fragment>
                }
                else {
                    addTrigger = true;
                    if (add.bet.differentStakes) {
                        return <Fragment key={add.bet._id}>
                            <DifferentStakes
                                bet={add.bet}
                                finishedBetToServer={this.finishedBetToServer}
                                filterUserBets={this.filterUserBets}
                                getUserProfile={this.getUserProfile}
                                handleEdit={this.handleEdit}
                                rightUserCheck={rightUserCheck}
                                type={'approve-add'}
                                user={this.state.user}
                            />
                            <ApproveBox handleApproval={this.handleApproval} bet={add.bet._id} groupId={add.groupId} requestType="add" />
                        </Fragment>
                    }

                    else {
                        return <Fragment key={add.bet._id}>
                            <SameStakes
                                bet={add.bet}
                                finishedBetToServer={this.finishedBetToServer}
                                filterUserBets={this.filterUserBets}
                                getUserProfile={this.getUserProfile}
                                handleEdit={this.handleEdit}
                                rightUserCheck={rightUserCheck}
                                type={'approve-add'}
                                user={this.state.user} />
                            <ApproveBox handleApproval={this.handleApproval} bet={add.bet._id} groupId={add.groupId} requestType="add" />
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
                            finishedBetToServer={this.finishedBetToServer}
                            filterUserBets={this.filterUserBets}
                            getUserProfile={this.getUserProfile}
                            handleEdit={this.handleEdit}
                            rightUserCheck={rightUserCheck}
                            type={'approve-edit'}
                            user={this.state.user}
                        />
                        <ApproveBox handleApproval={this.handleApproval} bet={edit.bet._id} groupId={edit.groupId} requestType="edit" />
                    </Fragment>
                }
                else {
                    editTrigger = true;
                    if (edit.bet.differentStakes) {
                        return <Fragment key={edit.bet._id}>
                            <DifferentStakes
                                bet={edit.bet}
                                finishedBetToServer={this.finishedBetToServer}
                                filterUserBets={this.filterUserBets}
                                getUserProfile={this.getUserProfile}
                                handleEdit={this.handleEdit}
                                rightUserCheck={rightUserCheck}
                                type={'approve-edit'}
                                user={this.state.user}
                            />
                            <ApproveBox handleApproval={this.handleApproval} bet={edit.bet._id} groupId={edit.groupId} requestType="edit" />
                        </Fragment>
                    }

                    else {
                        return <Fragment key={edit.bet._id}>
                            <SameStakes
                                bet={edit.bet}
                                finishedBetToServer={this.finishedBetToServer}
                                filterUserBets={this.filterUserBets}
                                getUserProfile={this.getUserProfile}
                                handleEdit={this.handleEdit}
                                rightUserCheck={rightUserCheck}
                                type={'approve-edit'}
                                user={this.state.user} />
                            <ApproveBox handleApproval={this.handleApproval} bet={edit.bet._id} groupId={edit.groupId} requestType="edit" />
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
                            chooseBetWinner={this.chooseBetWinner}
                            finishedBetToServer={this.finishedBetToServer}
                            finishID={this.state.finishID}
                            filterUserBets={this.filterUserBets}
                            getUserProfile={this.getUserProfile}
                            handleEdit={this.handleEdit}
                            handleFinish={this.handleFinish}
                            rightUserCheck={rightUserCheck}
                            type={'approve-finish'}
                            winner={finish.bet.winner}
                            user={this.state.user}
                        />
                        <ApproveBox handleApproval={this.handleApproval} bet={finish.bet._id} groupId={finish.groupId} requestType="finish" />
                    </Fragment>
                }
                else {
                    finishTrigger = true;
                    if (finish.bet.differentStakes) {
                        return <Fragment key={finish.bet._id}>
                            <DifferentStakes
                                bet={finish.bet}
                                chooseBetWinner={this.chooseBetWinner}
                                finishedBetToServer={this.finishedBetToServer}
                                finishID={this.state.finishID}
                                filterUserBets={this.filterUserBets}
                                getUserProfile={this.getUserProfile}
                                handleFinish={this.handleFinish}
                                handleEdit={this.handleEdit}
                                rightUserCheck={rightUserCheck}
                                type={'approve-finish'}
                                winner={finish.bet.winner}
                                user={this.state.user}
                            />
                            <ApproveBox handleApproval={this.handleApproval} bet={finish.bet._id} groupId={finish.groupId} requestType="finish" />
                        </Fragment>
                    }

                    else {
                        return <Fragment key={finish.bet._id}>
                            <SameStakes
                                bet={finish.bet}
                                chooseBetWinner={this.chooseBetWinner}
                                finishedBetToServer={this.finishedBetToServer}
                                finishID={this.state.finishID}
                                filterUserBets={this.filterUserBets}
                                getUserProfile={this.getUserProfile}
                                handleFinish={this.handleFinish}
                                handleEdit={this.handleEdit}
                                rightUserCheck={rightUserCheck}
                                type={'approve-finish'}
                                winner={finish.bet.winner}
                                user={this.state.user} />
                            <ApproveBox handleApproval={this.handleApproval} bet={finish.bet._id} groupId={finish.groupId} requestType="finish" />
                        </Fragment>
                    }
                }
            })
        }
        return (
            <div className="all-bets-container basic-column-fx wrap-fx align-center-fx">
                {!addTrigger && !editTrigger && !finishTrigger ?
                    <div id="no-waiting-bets-container" className="basic-column-fx justify-evenly-fx">
                        <div id="no-waiting-bets-holder" className="basic-fx justify-evenly-fx">
                            You approved everything!
                        <FontAwesomeIcon
                                icon={faCheck} />
                        </div>
                        <ReturnButton
                            classToDisplay="justify-center-fx"
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
                            classToDisplay="justify-center-fx return-button-space"
                            returnToMain={returnToMain.bind(null, this.props)}
                            text="Main menu" />
                    </div>}
            </div>
        )
    }
}

export default WaitingForApproval;