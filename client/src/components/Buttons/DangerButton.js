import React from 'react';
import './styles.scss';

const DangerButton = (props) => {
    return (
        <div className="danger-button-shape">
            <button disabled={props.disabled} type={props.type} onClick={props.handleDangerButton}>{props.text}</button>
        </div>
    );
};

export default DangerButton;