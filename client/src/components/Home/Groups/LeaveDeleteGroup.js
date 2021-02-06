import React from 'react';

const LeaveDeleteGroup = (props) => {
    return (
        <div className="basic-column-fx align-center-fx justify-around-fx" id="leave-delete-group">
            <div>{props.question}</div>
                <div id="deactivate-note">{props.noteText}</div>
           <div className="deactivate-auth-line deactivate-label">
                <label htmlFor="deactivate-checkbox">I understand and want to {props.doubleCheckText} group!</label>
                <input type="checkbox" id="deactivate-checkbox" onChange={props.handleCheckbox} defaultChecked={false} />
        </div>
    <button className="deactivate-button" disabled={!props.warningCheck} type="submit" onClick={props.handleLeaveDelete}>{props.buttonText}</button>
        </div>
    );
};

export default LeaveDeleteGroup;