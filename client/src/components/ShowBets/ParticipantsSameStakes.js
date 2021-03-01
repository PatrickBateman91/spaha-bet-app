import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import AmountTwoParticipants from './AmountTwoParticipants';
import AmountMoreParticipants from './AmountMoreParticipants';

const ParticipantsSameStakes = (props) => {
    return (
        <div className="participant-holder basic-fx wrap-fx justify-between-fx">
            {props.bet.participants.length === 2 ?
               null
                :
              <AmountMoreParticipants bet={props.bet} />}
            {props.bet.participants.map((participant, index) => {
                return (
                    <Fragment  key={participant.name + index}>
                    <div className="participant-row">
                        <div className={`participant-name ${props.user.nickname === participant.name ? "participant-user" : "participant-other"}`}
                            onClick={e => props.reDirect(e, `/profile/${participant.name}`)}>
                            {participant.name}
                            {props.type === "finished" || props.type === "approve-finish" ? participant.name === props.bet.winner ? <div className="winner-check"><FontAwesomeIcon icon={faCheck} /></div> : null : null}
                        </div>
                        <div className="participant-value basic-fx justify-center-fx"><span>{participant.value}</span></div>
                    </div>
                    {props.bet.participants.length === 2 && index === 0 ?  <AmountTwoParticipants bet={props.bet} /> : null}
                    </Fragment>
                )
            })}

        </div>
    );
};

export default ParticipantsSameStakes;                          