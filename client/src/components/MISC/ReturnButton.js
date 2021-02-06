import React from 'react';

const ReturnButton = (props) => {
    return (
        <div className={props.classToDisplay}>
            <div onClick={props.returnToMain}>{props.text}</div>
        </div>
    );
};

export default ReturnButton;