import React from 'react';
import { choosePicture } from '../../services/HelperFunctions/HelperFunctions';

const AmountMoreParticipants = (props) => {
    return (
        <div className="amount-bet-more-participants basic-fx justify-center-fx">
            {props.bet.type === "money" ? choosePicture(props.bet.amount) !== null ?
                <img src={choosePicture(props.bet.amount)} alt="slika novca" /> :
                <span>{props.bet.amount}$</span>
                : <span>{props.bet.stake}</span>}
        </div>
    );
};

export default AmountMoreParticipants;