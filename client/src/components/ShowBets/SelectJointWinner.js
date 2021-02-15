import React from 'react';
import { compareArrays } from '../../services/HelperFunctions/HelperFunctions';

const SelectJointWinner = (props) => {
    return (
        <div id="finish-bet" className={props.bet._id === props.finishID ? "basic-column-fx align-center-fx" : "display-none"}>
            <div id="finish-bet-clicked" className="basic-column-fx wrap-fx align-center-fx justify-evenly-fx" onClick={e => e.stopPropagation()}>
                <div>Who won the bet?</div>
                <div className="basic-fx wrap-fx">
                    <div className={`joint-winners basic-column-fx align-between-fx justify-center-fx ${compareArrays(props.bet.participants[0].participants, props.winner) ? "winner-marked" : ""}`}>
                        {props.bet.participants[0].participants.map(item => {
                            return (
                                <span
                                    className={props.user.nickname === item ? "participant-user" : "participant-other"}
                                    key={item}
                                    onClick={e => props.chooseBetWinner(e, props.bet.participants[0].participants)}>
                                    {item}
                                </span>)
                        })}
                    </div>
                    <div className={`joint-winners basic-column-fx align-between-fx justify-center-fx ${compareArrays(props.bet.participants[1].participants, props.winner) ? "winner-marked" : ""}`}>
                        {props.bet.participants[1].participants.map(item => {
                            return (
                                <span
                                    className={`${props.user.nickname === item ? "participant-user" : "participant-other"}`}
                                    key={item}
                                    onClick={e => props.chooseBetWinner(e, props.bet.participants[1].participants)}>
                                    {item}
                                </span>)
                        })}
                    </div>
                </div>

                <div className={`no-winner ${props.winner === "nobody" ? "winner-marked" : ""}`} onClick={e => props.chooseBetWinner(e, "nobody")}>Nobody won?</div>
                <button onClick={e => props.finishedBetToServer(e, props.bet, props.bet._id)} type="button">Confirm</button>
            </div>
        </div>
    );
};

export default SelectJointWinner;