import React from 'react';
import './styles.scss'

const AuthButton = (props) => {
    return (
        <div className={`auth-button-shape ${props.classToDisplay ? props.classToDisplay : ""}`}>
            <button type="submit" form={props.form}>{props.text}</button>
        </div>
    );
};

export default AuthButton;