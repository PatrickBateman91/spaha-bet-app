import React from 'react';
import ConfirmButton from '../../Buttons/ConfirmButton';
import './styles.scss';

const ChangeGroupName = (props) => {
    return (
        <div id="change-modal" className="basic-column-fx justify-center-fx align-center-fx wrap-fx">
            <form name="change-group-name" id="change-group-name" onSubmit={props.handleChangeGroupName}>
                <div className="basic-column-fx wrap-fx justify-center-fx align-center-fx">
                    <div className="change-account-line">
                        <label htmlFor="new-group-name">New group name</label>
                        <input type="text" name="new-group-name" id="new-group-name" placeholder="type new group name" autoComplete="group name" onChange={props.hideMessages}></input>
                    </div>
                    <ConfirmButton classToDisplay="confirm-button-space" text="Change group name" type="submit" />
                </div>
            </form>
        </div>
    );
};

export default ChangeGroupName;