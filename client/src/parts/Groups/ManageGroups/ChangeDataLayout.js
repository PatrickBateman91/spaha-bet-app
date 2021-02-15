import React from 'react';

const ChangeDataLayout = (props) => {
    return (
        <div className={`${props.classToDisplay ? props.classToDisplay : ""} basic-column-fx`} id={props.id}>
            {props.children}
        </div>
    );
};

export default ChangeDataLayout;