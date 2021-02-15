import React from 'react';
import './styles.scss';

const Checkbox = (props) => {
    return (
        <div className="full-line-space basic-fx justify-between-fx">
            <label htmlFor={props.id}>{props.text}</label>
            <input type="checkbox" id={props.id} name={props.id} onChange={e => props.function(e)} />
        </div>
    );
};

export default Checkbox;