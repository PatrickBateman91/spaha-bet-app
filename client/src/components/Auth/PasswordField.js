import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUnlockAlt, faLock } from '@fortawesome/free-solid-svg-icons';

const InputField = (props) => {
  return (
    <div className={props.classToDisplay}>
      <label htmlFor={props.id}>{props.label}</label>

      <input type={props.type}
        name={props.id}
        id={props.id}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete} />
       <FontAwesomeIcon onClick={props.showPassword} icon={props.passwordShown ? faUnlockAlt : faLock} /> 
    </div>
  );
};

export default InputField;