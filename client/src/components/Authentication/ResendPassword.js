import React, { useState } from 'react';
import ReturnButton from '../MISC/ReturnButton';
import {resendPasswordRequest} from '../Axios/UserRequests';
import { returnToMain, checkCorrectMailFormat} from '../DumbComponents/SimpleFunctions';

const ResendPassword = (props) => {
    const [error, handleError] = useState(false);
    const [success, handleSuccess] = useState(false);
    const [errorMessage, handleErrorMessage] = useState("");
    const handleResetPassword = (e) => {
        e.preventDefault();
        const email = document.getElementById('resend-password-input').value;
        if(checkCorrectMailFormat(email)){
            const resendPasswordPromise = resendPasswordRequest(email);
            resendPasswordPromise.then(res => {
                handleSuccess(true);
                setTimeout(props.history.push('/'), 1500);
            }).catch(err => {
                handleError(true);
                handleErrorMessage(err.response.data);
            })
        } else{
            handleError(true);
            handleErrorMessage("Email is not correctly formatted!");
        }
    }
    return (
        <div className="main-container main-background basic-column-fx align-center-fx justify-center-fx">
            <div className="auth-form-holder basic-column-fx wrap-fx justify-center-fx align-center-fx">
                <form name="resend-password" id="resend-password" onSubmit={e => handleResetPassword(e)}>
                <div className="basic-column-fx justify-between-fx align-center-fx wrap-fx">
                <div className="basic-column-fx wrap-fx justify-center-fx align-center-fx">
                    <div className="change-account-line">
                        <label htmlFor="resend-password">Type your email:</label>
                        <input type="text" name="resend-password-input" id="resend-password-input" placeholder="Type email to reset your password" autoComplete="enail"></input>
                    </div>
                    {error ? <div className="error-message">{errorMessage}</div> : null}
              {success ? <div className="success-message">Email reset link sent! Be sure to check your spam folder!</div> : null}
                    <div className="auth-button">
                    <button type="submit" form="resend-password" >Reset password</button>
                </div>
                </div>
                </div></form>

            </div>
            <ReturnButton returnToMain={returnToMain.bind(null, props)}
                classToDisplay="return-add-button" text={"Main menu"} />
        </div>
    );
};

export default ResendPassword;