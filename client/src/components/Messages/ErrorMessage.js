import React from 'react';
import './styles.scss';

const ErrorMessage = (props) => {
    return (
        <div className={`error-message ${props.classToDisplay}`}><span>{props.text}</span></div>
    );
};

export default ErrorMessage;