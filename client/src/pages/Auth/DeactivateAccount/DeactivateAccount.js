import React, { useState } from 'react';
import { deactivateAccount } from '../../../services/Axios/UserRequests';
import { returnToMain } from '../../../services/HelperFunctions/HelperFunctions';
import DangerButton from '../../../components/Buttons/DangerButton';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import './styles.scss';

const DeactivateAccount = (props) => {
    const deleteAccount = () => {
        const deactivateAccountPromise = deactivateAccount();
        deactivateAccountPromise.then(res => {
            props.history.push('/goodbye');
        }).catch(err => {
            props.history.push('/');
        })
    }
    const [checkBoxClicked, handleCheckbox] = useState(false);
    return (
        <div className="main-container">
            <div className="deactivate-container basic-column-fx justify-between-fx align-center-fx">
                <div id="deactivate-question">Are you sure you want to deactivate your account?</div>
                <div id="deactivate-note">All your bets and groups will be deleted!</div>
                <div className="deactivate-auth-line deactivate-label">
                    <label htmlFor="deactivate-checkbox">I understand and want to delete my account!</label>
                    <input type="checkbox" id="deactivate-checkbox" onClick={() => handleCheckbox(document.getElementById('deactivate-checkbox').checked)} />
                </div>
                <DangerButton disabled={!checkBoxClicked} handleDangerButton={deleteAccount} text="Deactivate account" type="submit" />
            </div>
            <ReturnButton returnToMain={returnToMain.bind(null, props)}
                classToDisplay="justify-center-fx return-button-space return-button-medium" text="Main menu" />
        </div>
    );
};

export default DeactivateAccount;