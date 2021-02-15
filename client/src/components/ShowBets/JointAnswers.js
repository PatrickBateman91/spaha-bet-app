import React from 'react';

const JointAnswers = (props) => {
    return (
        <div className="joint-bet-answers-container basic-fx justify-around-fx">
            <div className="participant-value basic-fx justify-center-fx">
                <span>{props.bet.participants[0].value}</span>
            </div>
            <div className="participant-value basic-fx justify-center-fx">
                <span>{props.bet.participants[1].value}</span>
            </div>
        </div>
    );
};

export default JointAnswers;