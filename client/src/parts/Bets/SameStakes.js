import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faBalanceScaleRight, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import AdditionalClauses from '../../components/ShowBets/AdditionalClauses';
import EditChanges from '../../components/ShowBets/EditChanges';
import PaperPin from '../../components/ShowBets/PaperPin';
import ParticipantsSameStakes from '../../components/ShowBets/ParticipantsSameStakes';
import SelectRegularWinner from '../../components/ShowBets/SelectRegularWinner';
import TimeLimited from '../../components/ShowBets/TimeLimited';
import './styles.scss';

const SameStakes = (props) => {
    return (
        <div className="single-bet-container basic-fx wrap-fx" key={props.bet._id}>
            <PaperPin />
            {props.type === "finished" || props.type === "approve-finish" ? props.bet.winner === "nobody" ? <div className="no-winner-check">No winner <FontAwesomeIcon icon={faTimesCircle} /></div> : null : null}
            {props.type !== "active" ? null : props.bet._id === props.finishID ?
                <SelectRegularWinner
                    bet={props.bet}
                    chooseBetWinner={props.chooseBetWinner}
                    finishedBetToServer={props.finishedBetToServer}
                    finishID={props.finishID}
                    user={props.user}
                    winner={props.winner} /> : null}
            {props.user && props.type === 'active' && props.rightUserCheck(props.user.nickname, 'regular', props.bet) ?
                <div id="finish-icon-container">
                    <FontAwesomeIcon
                        icon={faBalanceScaleRight}
                        onClick={e => props.handleFinish(e, props.bet._id)} />
                </div>
                : null}
            <div id="bet-title">
                {`${props.type !== 'active' ? props.bet.subject : props.idx + ". " + props.bet.subject}`}
                {props.type === "active" ? props.rightUserCheck(props.user.nickname, 'regular', props.bet) ? <div className="edit-icon"><FontAwesomeIcon icon={faEdit} onClick={e => props.handleEdit(props.bet._id)} /></div> : null : null}
            </div>
            {props.type === "finished" ? null : props.bet.limitedDuration ? <TimeLimited time={props.bet.limitedDurationValue} /> : null}
            <ParticipantsSameStakes bet={props.bet} reDirect={props.reDirect} type={props.type} user={props.user} />
            {props.bet.additionalClauses.length > 0 ? props.bet.additionalClauses.map(clause => {
                return (
                    <AdditionalClauses clause={clause} key={clause} />
                )
            }) : null}
            {props.bet.type === "finished" ? null : props.bet.changes ?
                <EditChanges bet={props.bet} /> : null}
        </div>
    );
};

export default SameStakes;