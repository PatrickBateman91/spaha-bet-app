import React from 'react';
import { choosePicture } from '../../services/HelperFunctions/HelperFunctions';

const AmountTwoParticipants = (props) => {
    return (
        <div className="amount-bet-two-participants basic-fx justify-center-fx align-center-fx">
            {props.bet.type === "money" ?
                choosePicture(props.bet.amount) !== null ?
                    <img src={choosePicture(props.bet.amount)} alt="slika novca" /> : <span>{props.bet.amount}$</span>
                : <span>{props.bet.stake}</span>}
        </div>
    );
};

export default AmountTwoParticipants;