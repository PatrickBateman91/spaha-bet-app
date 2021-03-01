import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import './styles.scss';

const FinishedBet = (props) => {
    return (
        <div className="type-of-approval finished-bet">Finished bet <FontAwesomeIcon icon={faCheckCircle} /></div>
    );
};

export default FinishedBet;