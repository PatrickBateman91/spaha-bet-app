import React from 'react';
import { choosePicture } from '../../DumbComponents/SimpleFunctions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faInfoCircle, faEdit, faHistory, faBalanceScaleRight, faCheck, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { currentUrl } from '../../MISC/Mode';

const SameStakes = (props) => {
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
                        <div className={`no-winner ${props.winner === "nobody" ? "winner-marked" : ""}`} onClick={e => props.chooseBetWinner(e, "nobody")}>No winner?</div>
                        <button onClick={e => props.finishedBetToServer(e, props.bet, props.bet._id)} type="button">Confirm</button>
                    </div>
                </div> : null}

            {props.user && props.type === 'active' && props.rightUserCheck(props.user.nickname, 'regular', props.bet) ?
                <div id="finish-icon-container">
                    <FontAwesomeIcon
                        icon={faBalanceScaleRight}
                        onClick={e => props.handleFinish(e, props.bet._id)} />
                </div>
                : null}
            <div className="try-out-border-top-left"></div>
            <div id="bet-title">
                {`${props.type !== 'active' ? props.bet.subject : props.idx + ". " + props.bet.subject}`}
                {props.type === "active" ? props.rightUserCheck(props.user.nickname, 'regular', props.bet) ? <div className="edit-icon"><FontAwesomeIcon icon={faEdit} onClick={e => props.handleEdit(props.bet._id)} /></div> : null : null}
            </div>
            {props.type === "finished" ? null : props.bet.limitedDuration ?
                <div className="clock-holder">
                    <FontAwesomeIcon icon={faClock} />
                    <div className="show-hide-duration">{props.bet.limitedDurationValue}</div>
                </div> : null}

            <div className="participant-holder basic-fx wrap-fx justify-between-fx">
                {props.bet.participants.length === 2 ?
                    <div className="amount-bet-two-participants basic-fx justify-center-fx align-center-fx">
                        {props.bet.type === "money" ?
                            choosePicture(props.bet.amount) !== null ?
                                <img src={choosePicture(props.bet.amount)} alt="slika novca" /> : <span>{props.bet.amount}$</span>
                            : <span>{props.bet.stake}</span>}
                    </div>
                    :
                    <div className="amount-bet-more-participants basic-fx justify-center-fx">
                        {props.bet.type === "money" ? choosePicture(props.bet.amount) !== null ?
                            <img src={choosePicture(props.bet.amount)} alt="slika novca" /> :
                            <span>{props.bet.amount}$</span>
                            : <span>{props.bet.stake}</span>}
                    </div>}
                {props.bet.participants.map((participant, index) => {
                    return (
                        <div className="participant-row" key={participant.name + index}>
                            <div className={`participant-name ${props.user.nickname === participant.name ? "participant1" : "participant8"}`}
                                onClick={e => props.getUserProfile(e, participant.name)}>
                                {participant.name}
                                {props.type === "finished" || props.type === "approve-finish" ? participant.name === props.bet.winner ? <div className="winner-check"><FontAwesomeIcon icon={faCheck}/></div> : null : null}
                            </div>
                            <div className="participant-value basic-fx justify-center-fx"><span>{participant.value}</span></div>
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
            {props.bet.type === "finished" ? null : props.bet.changes ? <div id="edit-changes" className="basic-fx justify-end-fx">
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

export default SameStakes;