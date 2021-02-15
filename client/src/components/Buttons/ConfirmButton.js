import React from 'react';

const ConfirmButton = (props) => {
    return (
        <div className={`confirm-button-shape ${props.classToDisplay ? props.classToDisplay : ""}`}>
            <button type={props.type}>{props.text}</button>
        </div>
    );
};

export default ConfirmButton;