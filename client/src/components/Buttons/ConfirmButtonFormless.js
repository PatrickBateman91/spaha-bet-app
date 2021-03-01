import React from 'react';

const ConfirmButton = (props) => {
    return (
        <div className={`confirm-button-shape ${props.classToDisplay ? props.classToDisplay : ""}`}>
            <button onClick={props.clickHandler}  type={props.type}>{props.text}</button>
        </div>
    );
};

export default ConfirmButton;