import React from 'react';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AdditionalClauses = (props) => {
    return (
        <div className="additional-clauses-container">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span>{props.clause}</span>
        </div>
    );
};

export default AdditionalClauses;