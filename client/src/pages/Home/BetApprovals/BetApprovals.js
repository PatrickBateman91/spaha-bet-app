import React, { Fragment, useState, useEffect, useCallback } from 'react';
import {withRouter} from 'react-router-dom';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck} from '@fortawesome/free-solid-svg-icons';
import { calculateBalance, changeSingleGroup, getShortStats, rightUserCheck } from '../../../services/HelperFunctions/HelperFunctions';
import { uploadApprovalRequest } from '../../../services/Axios/BetRequests';
import ApproveBox from '../../../components/ApproveBox/ApproveBox';
import DifferentStakesMockUp from '../../../parts/Bets/DifferentStakesMockUp';
import JointBetMockUp from '../../../parts/Bets/JointBetMockUp';
import SameStakesMockUp from '../../../parts/Bets/SameStakesMockUp';
import SuccessModal from '../../../components/Modals/SuccessModal';
import './styles.scss';

const WaitingForApproval = (props) => {
    const [allBets, setAllBets] = useState([]);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [pageLoaded, setPageLoaded] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    //Ako je gost '> Home
    useEffect(() => {
        if (props.user === "guest") {
            props.history.push('/');
        }
    }, [props.user, props.history])


    const updateData = useCallback(() => {
        let allBets = [];
        props.groups.forEach(group => {
            group.betsWaitingForAddApproval.forEach(bet => {
                if (bet.approvedAddArray.indexOf(props.user.nickname) === -1) {
                    let userCheck;
                    if (bet.jointBet) {
                        userCheck = rightUserCheck(props.user.nickname, "jointBet", bet);
                    }
                    else {
                        userCheck = rightUserCheck(props.user.nickname, "regular", bet);
                    }
                    if (userCheck) {
                        allBets.push({
                            bet: bet,
                            groupId: group._id,
                            requestType: "add",
                            type:"approve-add"
                        });
                    }
                }
            })
            group.betsWaitingForEditApproval.forEach(bet => {
                if (bet.approvedEditArray.indexOf(props.user.nickname) === -1) {
                    let userCheck;
                    if (bet.jointBet) {
                        userCheck = rightUserCheck(props.user.nickname, "jointBet", bet);
                    }
                    else {
                        userCheck = rightUserCheck(props.user.nickname, "regular", bet);
                    }
                    if (userCheck) {
                        allBets.push({
                            bet: bet,
                            groupId: group._id,
                            requestType: "edit",
                            type:"approve-edit"
                        });
                    }
                }
            })
            group.betsWaitingForFinishedApproval.forEach(bet => {
                if (bet.approvedFinishArray.indexOf(props.user.nickname) === -1) {
                    let userCheck;
                    if (bet.jointBet) {
                        userCheck = rightUserCheck(props.user.nickname, "jointBet", bet);
                    }
                    else {
                        userCheck = rightUserCheck(props.user.nickname, "regular", bet);
                    }
                    if (userCheck) {
                        allBets.push({
                            bet: bet,
                            groupId: group._id,
                            requestType: "finish",
                            type:"approve-finish"
                        });
                    }
                }
            })
        })
        setAllBets(allBets);
        setError(false);
        setPageLoaded(true);
        setSuccess(false);
        document.body.style.pointerEvents = "auto";
        document.body.style.cursor = "auto";
    }, [props.groups, props.user.nickname])

    const handleApproval = (e, functionProps, answer) => {
        e.stopPropagation();
        document.body.style.pointerEvents = "none";
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
            setSuccess(true);
            setSuccessMessage(message);
            setTimeout(() => document.getElementById('success-modal-container').style.top = `${window.pageYOffset}px`, 0)

            const changedGroups = changeSingleGroup(props.groups, functionProps.groupID, groupResponse.data.payload);
            props.setGroups(changedGroups);

            setTimeout(() => {
                props.setNeedsUpdate(true);
                document.body.style.pointerEvents = 'auto';
                document.body.style.cursor = 'auto';
                setSuccess(false);
                setSuccessMessage("");
            }, 1000)
        }).catch(err => {
            console.log(err);
            setError(true);
            setErrorMessage(err.response.data.message);
        })
    }

    //First load
    useEffect(() => {
        if (!pageLoaded && props.appLoaded) {
            window.scrollTo(0, 0);
            document.getElementById('root').style.height = "100%";
            updateData(props.groups, props.user.nickname);
        }

    }, [pageLoaded, props.appLoaded, props.user.nickname, updateData, props.groups])

    useEffect(() => {
        if (props.needsUpdate) {
            let statsObject = getShortStats(props.groups, props.user.nickname);
            statsObject.balance = calculateBalance(props.groups, props.user.nickname);
            props.setShortStats(statsObject);
            updateData();
            props.setNeedsUpdate(false);
        }
    }, [props.needsUpdate, updateData, props])
    let allBetsDivs = [];
    if (pageLoaded) {
        allBetsDivs = allBets.map(approvedBet => {
            if(approvedBet.bet.jointBet){
                return <div className="approve-single-box basic-column-fx align-center-fx" key={approvedBet.bet._id}>
                    <JointBetMockUp
                        bet={approvedBet.bet}
                        reDirect={props.reDirect}
                        rightUserCheck={rightUserCheck}
                        type={approvedBet.type}
                        user={props.user}
                    />
                    <ApproveBox handleApproval={handleApproval} bet={approvedBet.bet._id} groupID={approvedBet.groupId} requestType={approvedBet.requestType} />
                </div>
            }

            else{
                if(approvedBet.bet.differentStakes){
                    return <div className="approve-single-box basic-column-fx align-center-fx" key={approvedBet.bet._id}>
                    <DifferentStakesMockUp
                        bet={approvedBet.bet}
                        reDirect={props.reDirect}
                        type={approvedBet.type}
                        user={props.user}
                    />
                    <ApproveBox handleApproval={handleApproval} bet={approvedBet.bet._id} groupID={approvedBet.groupId} requestType={approvedBet.requestType} />
                </div>
                }

                else{
                    return <div className="approve-single-box basic-column-fx align-center-fx" key={approvedBet.bet._id}>
                    <SameStakesMockUp
                        bet={approvedBet.bet}
                        reDirect={props.reDirect}
                        type={approvedBet.type}
                        user={props.user} />
                    <ApproveBox handleApproval={handleApproval} bet={approvedBet.bet._id} groupID={approvedBet.groupId} requestType={approvedBet.requestType} />
                </div>
                }
            }
        })
    }
    return (
        <Fragment>
            <div className="bets-approval-container basic-column-fx wrap-fx align-center-fx justify-center-fx">
                <div className="bets-approval-title">Approve bets</div>
                {!allBets.length > 0 ?
                    <div id="no-waiting-bets-container" className="basic-column-fx">
                        <div id="no-waiting-bets-holder" className="basic-fx justify-evenly-fx align-center-fx">
                            <div className="no-waiting-bets-body basic-fx justify-evenly-fx align-center-fx">
                                <span>You're all caught up!</span>
                                <FontAwesomeIcon icon={faCheck} />
                            </div>
                        </div>
                    </div>
                    :
                    <div className={`bets-approval-holder basic-fx wrap-fx ${allBets.length === 1 ? "justify-center-fx" : ""}`}>

                    {allBets.length > 0 ? allBetsDivs : null}
                        
                    </div>}
            </div>
            {success ? <SuccessModal message={successMessage} /> : null}
        </Fragment>
    )
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WaitingForApproval));