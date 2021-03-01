import React from 'react';
import { compareArrays } from '../../services/HelperFunctions/HelperFunctions';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ParticipantsJointBet = (props) => {
    return (
        <div className="joint-bet-holder basic-fx justify-between-fx">
            <div className={`joint-display-side basic-column-fx`}>
                {props.type === "finished" || props.type === "approve-finish" ? compareArrays(props.bet.winner, props.bet.participants[0].participants) ?
                    <div className="joint-finished-winner-left"><FontAwesomeIcon icon={faCheck} /></div>
                    : null : null}

                {props.bet.participants[0].participants.map((name, index) => {
                    return (
                        <div className="basic-fx justify-between-fx align-center-fx" key={name}>
                            <span className={`joint-participant-name ${props.user.nickname === name ? "participant-user" : "participant-other"}`}
                                onClick={e => props.reDirect(e, `/profile/${name}`)}>{name}
                            </span>

                            {props.bet.type === "money" ?
                                <span className="joint-bets-bet basic-fx justify-center-fx align-center-fx bet-left">
                                    {`${(props.bet.participants[0].bet / props.bet.participants[0].participants.length).toFixed(2)} $`}
                                </span>
                                : index === 0 ?
                                    <div className="joint-bets-bet basic-fx justify-center-fx align-center-fx bet-left">
                                        {`${props.bet.participants[0].bet}`}
                                        {props.bet.type === "money" ? `${(props.bet.participants[0].bet / props.bet.participants[0].participants.length).toFixed(2)} $` : null}
                                    </div> : null}
                        </div>
                    )
                })}
            </div>
            <div className={`joint-display-side basic-column-fx`}>
                {props.type === "finished" || props.type === "approve-finish" ? compareArrays(props.bet.winner, props.bet.participants[1].participants) ?
                    <div className="joint-finished-winner-right"><FontAwesomeIcon icon={faCheck} /></div>
                    : null : null}
                {props.bet.participants[1].participants.map((name, index) => {
                    return (
                        <div className="basic-fx justify-between-fx align-center-fx" key={name}>
                            {props.bet.type === "money" ?
                                <span className="joint-bets-bet bet-right">
                                    {`${(props.bet.participants[1].bet / props.bet.participants[1].participants.length).toFixed(2)} $`}
                                </span>
                                : index === 0 ?
                                    <span className="joint-bets-bet bet-right">
                                        {`${props.bet.participants[1].bet}`}
                                        {props.bet.type === "money" ? `${(props.bet.participants[1].bet / props.bet.participants[1].participants.length).toFixed()} $` : null}
                                    </span> : <span className="bet-right"></span>}
                            <span className={`joint-participant-name ${props.user.nickname === name ? "participant-user" : "participant-other"}`} onClick={e => props.reDirect(e, `/profile/${name}`)}>{name}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default ParticipantsJointBet;