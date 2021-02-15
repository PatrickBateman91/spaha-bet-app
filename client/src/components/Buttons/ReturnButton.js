import React from 'react';
import './styles.scss'

const ReturnButton = (props) => {
    return (
        <div className={`return-button-shape ${props.classToDisplay ? props.classToDisplay : ""}`}>
            <div onClick={props.returnToMain}>{props.text}</div>
        </div>
    );
};

export default ReturnButton;