import React, { useState } from 'react';
import { resendPasswordRequest } from '../../../services/Axios/UserRequests';
import { returnToMain, checkCorrectMailFormat } from '../../../services/HelperFunctions/HelperFunctions';
import AuthButton from '../../../components/Buttons/AuthButton';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import SuccessMessage from '../../../components/Messages/SuccessMessage';

const ResendPassword = (props) => {
    const [error, handleError] = useState(false);
    const [success, handleSuccess] = useState(false);
    const [errorMessage, handleErrorMessage] = useState("");
    const handleResetPassword = (e) => {
        e.preventDefault();
        const email = document.getElementById('resend-password-input').value;
        if (checkCorrectMailFormat(email)) {
            const resendPasswordPromise = resendPasswordRequest(email);
            resendPasswordPromise.then(res => {
                handleSuccess(true);
                setTimeout(props.history.push('/'), 1500);
            }).catch(err => {
                handleError(true);
                handleErrorMessage(err.response.data);
            })
        } else {
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
                            {error ? <ErrorMessage text={errorMessage} /> : null}
                            {success ? <SuccessMessage text="Email reset link sent! Be sure to check your spam folder!" /> : null}
                            <AuthButton classToDisplay="auth-button-space" text="Reset password" form="resend-password" />
                        </div>
                    </div></form>
            </div>
            <ReturnButton returnToMain={returnToMain.bind(null, props)}
                classToDisplay="return-button-space" text={"Main menu"} />
        </div>
    );
};

export default ResendPassword;