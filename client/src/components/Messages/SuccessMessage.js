import React from 'react';
import './styles.scss';

const SuccessMessage = (props) => {
    return (
        <div className={`success-message ${props.classToDisplay ? props.classToDisplay : ""}`}><span>{props.text}</span></div>
    );
};

export default SuccessMessage;