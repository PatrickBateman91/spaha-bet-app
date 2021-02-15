import React from 'react';
import './styles.scss';

const InputField = (props) => {
    return (
        <div className="full-line-space basic-fx justify-between-fx">
            <label htmlFor={props.id}>{props.text}</label>
            <input type="text" id={props.id} name={props.id} />
        </div>
    );
};

export default InputField;