import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen} from '@fortawesome/free-solid-svg-icons';
import './styles.scss';

const EditedBet = (props) => {
    return (
        <div className="type-of-approval edited-bet">Edited bet <FontAwesomeIcon icon={faPen} /></div>
    );
};

export default EditedBet;