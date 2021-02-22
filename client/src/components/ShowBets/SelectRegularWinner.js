import React from 'react';
import './styles.scss';

const SelectRegularWinner = (props) => {
    return (
        <div id="finish-bet" className="basic-column-fx align-center-fx">
            <div id="finish-bet-clicked" className="basic-column-fx wrap-fx align-center-fx justify-evenly-fx" onClick={e => e.stopPropagation()}>
                <div>Who won the bet?</div>
                <div className="regular-bet-winners">
                    {props.bet.participants.map(item => {
                        return (
                            <span
                                className={`${props.user.nickname === item.name ? "participant-user" : "participant-other"} ${props.winner === item.name ? "winner-marked" : ""}`}
                                key={item.name}
                                onClick={e => props.chooseBetWinner(e, item.name)}>
                                {item.name}
                            </span>)
                    })}
                </div>
                <div className={`no-winner ${props.winner === "nobody" ? "winner-marked" : ""}`} onClick={e => props.chooseBetWinner(e, "nobody")}>Nobody won?</div>
                <button onClick={e => props.finishedBetToServer(e, props.bet, props.bet._id)} type="button">Confirm</button>
            </div>
        </div>
    );
};

export default SelectRegularWinner;