import React from 'react';
import './styles.scss';

const AdditionalClauses = (props) => {
    return (
        <div className="full-line-space basic-fx justify-between-fx">
            <label htmlFor={`newBetAdditionalClause${props.index + 1}`}>{`Additional clause ${props.index + 1}`}</label>
            <span className="removeAdditionalClauseOrParticipant" onClick={props.removeAdditionalClause}>x</span>
            <input 
                type="text" id={`newBetAdditionalClause${props.index + 1}`}
                onChange={props.settingAdditionalClauseValue}
                value={props.value}
                name={`newBetAdditionalClause${props.index + 1}`} />
        </div>
    );
};

export default AdditionalClauses;