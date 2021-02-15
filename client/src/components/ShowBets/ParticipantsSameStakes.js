import React from 'react';
import { choosePicture } from '../../services/HelperFunctions/HelperFunctions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const ParticipantsSameStakes = (props) => {
    return (
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
                        <div className={`participant-name ${props.user.nickname === participant.name ? "participant-user" : "participant-other"}`}
                            onClick={e => props.getUserProfile(e, participant.name)}>
                            {participant.name}
                            {props.type === "finished" || props.type === "approve-finish" ? participant.name === props.bet.winner ? <div className="winner-check"><FontAwesomeIcon icon={faCheck} /></div> : null : null}
                        </div>
                        <div className="participant-value basic-fx justify-center-fx"><span>{participant.value}</span></div>
                    </div>
                )
            })}

        </div>
    );
};

export default ParticipantsSameStakes;