import React, { useState } from 'react';
import { connect } from 'react-redux';
import { deactivateAccount } from '../../../services/Axios/UserRequests';
import { returnToMain } from '../../../services/HelperFunctions/HelperFunctions';
import DangerButton from '../../../components/Buttons/DangerButton';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import './styles.scss';

const DeactivateAccount = (props) => {
    document.getElementById('root').style.height = "100%";
    if (props.user === "guest") {
        window.location.replace("https://spaha-betapp.netlify.app");
    }

    const deleteAccount = () => {
        const deactivateAccountPromise = deactivateAccount();
        deactivateAccountPromise.then(res => {
            props.history.push('/goodbye');
        }).catch(err => {
            console.log(err.response);
            window.location.replace("/");
        })
    }
    const [checkBoxClicked, handleCheckbox] = useState(false);


    return (
        <div className="main-container">
            <div className="deactivate-container basic-column-fx justify-between-fx align-center-fx">
                <div className="auth-form-holder basic-column-fx justify-between-fx align-center-fx">
                <div id="deactivate-question">Are you sure you want to deactivate your account?</div>
                <div id="deactivate-note">All your bets and groups will be deleted!</div>
                <div className="deactivate-auth-line deactivate-label">
                    <label htmlFor="deactivate-checkbox">I understand and want to delete my account!</label>
                    <input type="checkbox" id="deactivate-checkbox" onClick={() => handleCheckbox(document.getElementById('deactivate-checkbox').checked)} />
                </div>
                <DangerButton disabled={!checkBoxClicked} handleDangerButton={deleteAccount} text="Deactivate account" type="submit" />
            </div>
            </div>
            <ReturnButton returnToMain={returnToMain.bind(null, props)}
                classToDisplay="justify-center-fx return-button-space return-button-medium" text="Main menu" />
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps, null)(DeactivateAccount);