import React from 'react';
import DangerButton from '../../Buttons/DangerButton';

const LeaveDeleteGroup = (props) => {
    return (
        <div className="basic-column-fx align-center-fx justify-around-fx" id="leave-delete-group">
            <div>{props.question}</div>
            <div id="deactivate-note">{props.noteText}</div>
            <div className="deactivate-auth-line deactivate-label">
                <label htmlFor="deactivate-checkbox">I understand and want to {props.doubleCheckText} group!</label>
                <input type="checkbox" id="deactivate-checkbox" onChange={props.handleCheckbox} defaultChecked={false} />
            </div>
            <DangerButton classToDisplay="" disabled={!props.warningCheck} handleDangerButton={props.handleLeaveDelete} type="button" text={props.buttonText} />
        </div>
    );
};

export default LeaveDeleteGroup;