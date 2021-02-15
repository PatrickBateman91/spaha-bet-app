import React from 'react';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TimeLimited = (props) => {
    return (
        <div className="clock-holder">
            <FontAwesomeIcon icon={faClock} />
            <div className="show-hide-duration">{props.time}</div>
        </div>
    );
};

export default TimeLimited;