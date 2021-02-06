import React, {useState} from 'react';
import ReturnButton from '../MISC/ReturnButton';
import {returnToMain} from '../DumbComponents/SimpleFunctions';
import {deactivateAccount} from '../Axios/UserRequests';

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
        <div className="main-container main-background">
        <div className="deactivate-container basic-column-fx justify-between-fx align-center-fx">
        <div id="deactivate-question">Are you sure you want to deactivate your account?</div>
        <div id="deactivate-note">All your bets and groups will be deleted!</div>
        <div className="deactivate-auth-line deactivate-label">
                <label htmlFor="deactivate-checkbox">I understand and want to delete my account!</label>
                <input type="checkbox" id="deactivate-checkbox" onClick={() => handleCheckbox(document.getElementById('deactivate-checkbox').checked)} />
        </div>
       <button className="deactivate-button" disabled={!checkBoxClicked} onClick={deleteAccount} type="submit">Deactivate account</button>
        </div>
        <ReturnButton returnToMain = {returnToMain.bind(null, props)} 
   classToDisplay="return-add-button" text={"Main menu"} />
    </div>
    );
};

export default DeactivateAccount;