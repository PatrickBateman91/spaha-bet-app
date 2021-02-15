import React from 'react';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const EditChanges = (props) => {
    return (
        <div id="edit-changes" className="basic-fx justify-end-fx">
            <FontAwesomeIcon icon={faHistory} />
            <div className="edit-change-item">
                <span id="change-title">Changes:</span>
                {props.bet.changes.map(item => {
                    return (
                        <div className="single-change-item" key={item.time}>
                            <span>{item.name}</span>
                            <span>{item.time}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default EditChanges;