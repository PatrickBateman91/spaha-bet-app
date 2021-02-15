import React from 'react';

const InputField = (props) => {
  return (
    <div className={props.classToDisplay}>
      <label htmlFor={props.id}>{props.label}</label>

      <input type={props.type}
        name={props.id}
        id={props.id}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete} />
    </div>
  );
};

export default InputField;