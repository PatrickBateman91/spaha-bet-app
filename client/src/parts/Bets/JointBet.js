import React from 'react';
import { faEdit, faBalanceScaleRight, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdditionalClauses from '../../components/ShowBets/AdditionalClauses';
import EditChanges from '../../components/ShowBets/EditChanges';
import PaperPin from '../../components/ShowBets/PaperPin';
import ParticipantsJointBet from '../../components/ShowBets/ParticipantsJointBet';
import SelectJointWinner from '../../components/ShowBets/SelectJointWinner';
import TimeLimited from '../../components/ShowBets/TimeLimited';
import JointAnswers from '../../components/ShowBets/JointAnswers';
import './styles.scss';

const JointBet = (props) => {
    return (
        <div className="single-bet-container basic-fx wrap-fx" key={props.bet._id}>
            <PaperPin />
            {props.type === "finished" || props.type === "approve-finish" ? props.bet.winner === "No winner" ? <div className="no-winner-check">No winner? <FontAwesomeIcon icon={faTimesCircle} /></div> : null : null}
            {props.type === "finished" ? null : props.bet._id === props.finishID ?
                <SelectJointWinner
                    bet={props.bet}
                    chooseBetWinner={props.chooseBetWinner}
                    finishedBetToServer={props.finishedBetToServer}
                    finishID={props.finishID}
                    user={props.user}
                    winner={props.winner} /> : null}
            {props.type !== "active" ? null : props.user ?
                <div id="finish-icon-container"><FontAwesomeIcon icon={faBalanceScaleRight} onClick={e => props.handleFinish(e, props.bet._id)} /> </div>
                : null}
            <div id="bet-title">
                {`${props.type !== "active" ? props.bet.subject : props.idx + ". " + props.bet.subject}`}
                {props.type === "active" && props.rightUserCheck(props.user.nickname, 'jointBet', props.bet) ? <div className="edit-icon"><FontAwesomeIcon onClick={e => props.handleEdit(props.bet._id)} icon={faEdit} /></div> : null}
            </div>
            {props.type === "finished" ? null : props.bet.limitedDuration ? <TimeLimited time={props.bet.limitedDurationValue} /> : null}
            <ParticipantsJointBet bet={props.bet} getUserProfile={props.getUserProfile} type={props.type} user={props.user} />
            <JointAnswers bet={props.bet} />
            {props.bet.additionalClauses.length > 0 ? props.bet.additionalClauses.map(clause => {
                return (
                    <AdditionalClauses clause={clause} key={clause} />
                )
            }) : null}
            {props.bet.changes ? <EditChanges bet={props.bet} /> : null}
        </div>
    );
};

export default JointBet;