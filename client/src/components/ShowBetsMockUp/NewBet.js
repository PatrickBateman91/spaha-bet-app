import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './styles.scss';

const NewBet = (props) => {
    return (
        <div className="type-of-approval added-bet">New bet <FontAwesomeIcon icon={faPlus} /></div>
    );
};

export default NewBet;