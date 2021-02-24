import React, { useState } from 'react';
import { resendPasswordRequest } from '../../../services/Axios/UserRequests';
import { returnToMain, checkCorrectMailFormat, windowWidth as usingMobile } from '../../../services/HelperFunctions/HelperFunctions';
import AuthButton from '../../../components/Buttons/AuthButton';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import SuccessMessage from '../../../components/Messages/SuccessMessage';

const ResendPassword = (props) => {
    window.scrollTo(0, 0);
    document.getElementById('root').style.height = "100%";
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleResetPassword = (e) => {
        e.preventDefault();
        const email = document.getElementById('resend-password-input').value;
        if (checkCorrectMailFormat(email)) {
            const resendPasswordPromise = resendPasswordRequest(email);
            resendPasswordPromise.then(res => {
                setSuccess(true);
                setTimeout(() => props.history.push('/'), 1500);
            }).catch(err => {
                setError(true);
                setErrorMessage(err.response.data.message);
            })
        } else {
            setError(true);
            setErrorMessage("Email is not correctly formatted!");
        }
    }
    return (
        <div className={`main-container basic-column-fx align-center-fx justify-center-fx ${usingMobile(480) ? "main-background" : "alternative-mobile-background"}`}>
            <div className="auth-form-holder basic-column-fx wrap-fx justify-center-fx align-center-fx resend-password-container">
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
                classToDisplay="return-button-space return-button-medium" text={"Main menu"} />
        </div>
    );
};

export default ResendPassword;