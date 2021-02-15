import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const ParticipantsDifferentStakes = (props) => {
    return (
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
                        <div className={`participant-name ${props.user.nickname === participant.name ? "participant-user" : "participant-other"}`}
                            onClick={e => props.getUserProfile(e, participant.name, props.bet.finished)}>{participant.name}
                            {props.type === "finished" || props.type === "approve-finish" ? participant.name === props.bet.winner ? <div className="winner-check"><FontAwesomeIcon icon={faCheck} /></div> : null : null}
                        </div>
                        <div className="participant-value basic-fx justify-center-fx"><span>{participant.value}</span></div>
                        {props.bet.participants.length > 2 ? <div className="participant-different-multiple-stake basic-fx align-center-fx justify-center-fx"><span>{participant.singleStake}</span></div> : null}
                    </div>
                )
            })}

        </div>
    );
};

export default ParticipantsDifferentStakes;