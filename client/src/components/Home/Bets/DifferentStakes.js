import React from 'react';
import {currentUrl} from '../../MISC/Mode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faInfoCircle, faEdit, faHistory, faBalanceScaleRight, faCheck, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const DifferentStakes = (props) => {
    return (
        <div className="single-bet-container basic-fx wrap-fx" key={props.bet._id}>
                <div className="home-paper-pin-container">
                <div>
                    <img src={`${currentUrl}/public/general/paper-pin.png`}  alt="paper-pin"/>
                </div>
            </div>
            {props.type === "finished" || props.type === "approve-finish" ? props.bet.winner === "nobody" ? <div className="no-winner-check">No winner <FontAwesomeIcon icon={faTimesCircle} /></div> : null : null}
            
            {props.type !== "active" ? null : props.bet._id === props.finishID ?
                <div id="finish-bet" className={props.bet._id === props.finishID ? "basic-column-fx align-center-fx" : "display-none"}>
                    <div id="finish-bet-clicked" className="basic-column-fx wrap-fx align-center-fx justify-evenly-fx" onClick={e => e.stopPropagation()}>
                        <div>Who won the bet?</div>
                        <div className="regular-bet-winners">
                            {props.bet.participants.map(item => {
                                return (
                                    <span
                                        className={`${props.user.nickname === item.name ? "participant1" : "participant8"} ${props.winner === item.name ? "winner-marked" : ""}`}
                                        key={item.name}
                                        onClick={e => props.chooseBetWinner(e, item.name)}>
                                        {item.name}
                                    </span>)
                            })}
                        </div >
                        <div className={`no-winner ${props.winner === "nobody" ? "winner-marked" : ""}`} onClick={e => props.chooseBetWinner(e, "nobody")}>Nije niko?</div>
                        <button onClick={e => props.finishedBetToServer(e, props.bet, props.bet._id)} type="button">Confirm</button>
                    </div>
                </div> : null}

            {props.type !== "active" ? null : props.rightUserCheck(props.user.nickname, 'regular', props.bet) ?
                <div id="finish-icon-container">
                    <FontAwesomeIcon
                        icon={faBalanceScaleRight}
                        onClick={e => props.handleFinish(e, props.bet._id)} />
                </div>
                : null}
            <div className="try-out-border-top-left"></div>
            <div id="bet-title">
                {`${props.type !== "active" ? props.bet.subject : props.idx + ". " + props.bet.subject}`}

                {props.type === "active" ? props.rightUserCheck(props.user.nickname, 'regular', props.bet) ?
                    <div className="edit-icon"><FontAwesomeIcon icon={faEdit} onClick={e => props.handleEdit(props.bet._id)} /></div> : null : null}
            </div>
            {props.type === "finished" ? null : props.bet.limitedDuration ?
                <div className="clock-holder">
                    <FontAwesomeIcon icon={faClock} />
                    <div className="show-hide-duration">
                        {props.bet.limitedDurationValue}
                    </div>
                </div> : null}

            <div className="participant-holder basic-fx wrap-fx justify-between-fx">
                {props.bet.participants.length === 2 ? <div className="different-stakes-container basic-fx justify-center-fx">
                    <div className="amount-bet-different-stakes basic-fx justify-around-fx">
                        {props.bet.participants.map(participant => {
                            return (
                                <div className="different-bet-stake" key={participant.singleStake}>
                                    {!isNaN(participant.singleStake) ?
                                        `${participant.singleStake}$` :
                                        participant.singleStake}
                                </div>
                            )
                        })}


                    </div>
                </div>
                    : null}
                {props.bet.participants.map(participant => {
                    return (
                        <div className="participant-row" key={participant.name}>
                            <div className={`participant-name ${props.user.nickname === participant.name ? "participant1" : "participant8"}`}
                                onClick={e => props.getUserProfile(e, participant.name, props.bet.finished)}>{participant.name}
                                {props.type === "finished" || props.type === "approve-finish" ? participant.name === props.bet.winner ? <div className="winner-check"><FontAwesomeIcon icon={faCheck} /></div> : null : null}
                            </div>
                            <div className="participant-value basic-fx justify-center-fx"><span>{participant.value}</span></div>
                            {props.bet.participants.length > 2 ? <div className="participant-different-multiple-stake basic-fx align-center-fx justify-center-fx"><span>{participant.singleStake}</span></div> : null}
                        </div>
                    )
                })}

            </div>
            {props.bet.additionalClauses.length > 0 ? props.bet.additionalClauses.map(clause => {
                return (
                    <div key={clause} className="additional-clauses-container">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <span>{clause}</span>
                    </div>
                )
            }) : null}
            {props.bet.changes ? <div id="edit-changes" className="basic-fx justify-end-fx">
                <FontAwesomeIcon icon={faHistory} />
                <div className="edit-change-item">
                    <span id="change-title">Changes:</span>
                    {props.bet.changes.map(item => {
                        return (
                            <div className="single-change-item" key={item.time}>
                                <span>{item.name}</span>
                                <span>{item.time}</span>
                            </div>
                        )
                    })}
                </div>
            </div> : null}
            <div className="try-out-border-bottom-right"></div>
        </div>
    );
};

export default DifferentStakes;