import React, { useState } from 'react';
import { checkEmailLink, changePasswordFromEmail } from '../../../services/Axios/UserRequests';
import { emptyFieldsCheck, passwordCheck } from '../../../services/HelperFunctions/HelperFunctions';
import AuthButton from '../../../components/Buttons/AuthButton';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import SuccessMessage from '../../../components/Messages/SuccessMessage';
import './styles.scss';

const NewPasswordFromEmail = (props) => {

    const [emailValid, setEmailValid] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    window.scrollTo(0, 0);

    const handleResetPassword = (e) => {
        e.preventDefault();
        const pass1 = document.getElementById('new-password1').value;
        const pass2 = document.getElementById('new-password2').value;
        if (!emptyFieldsCheck(pass1) || !emptyFieldsCheck(pass2)) {
            setError(true);
            setErrorMessage("Fields cannot be blank!");
        }
        if (pass1 !== pass2) {
            setError(true);
            setErrorMessage("Passwords do not match!");
        }
        if (!passwordCheck(pass1)) {
            setError(true);
            setErrorMessage("Password must be at least 6 characters long and include a number");
        }
        const changePasswordPromise = changePasswordFromEmail(props.match.params.uid, props.match.params.id, pass1);
        changePasswordPromise.then(res => {
            setSuccess(true);
            setSuccessMessage('Password changed successfully! You can login now!')
            setTimeout(() => props.history.push('/sign-in'), 1500);

        }).catch(err => {
            setError(true);
            setErrorMessage(err.response.data);

            if (err.response.data !== "New password cannot be same as the old password!") {
                setTimeout(() => props.history.push('/'), 1500);
            }
        })
    }

    const hideMessages = () => {
        setError(false);
        setErrorMessage("");
        setSuccess(false);
        setSuccessMessage("");
    }

    const checkEmailPromise = checkEmailLink(props.match.params.uid, props.match.params.id);
    checkEmailPromise.then(res => {
        if (res.data === "Email link is valid!") {
            setEmailValid(true);
        }
    }).catch(err => {
        props.history.push('/404')
    })

    return (
        <div className="main-container main-background">
            {emailValid ? <div className="fx-column fx-align-center reset-password-container">
                <form name="reset-password" id="reset-password" onChange={hideMessages} onSubmit={handleResetPassword}>
                    <div id="change-account-holder" className="basic-column-fx justify-between-fx align-center-fx wrap-fx">
                        <div className="change-account-line">
                            <label htmlFor="new-password1">Enter new password</label>
                            <input type="password" name="new-password1" id="new-password1" placeholder="Enter new password" autoComplete="password"></input>
                        </div>
                        <div className="change-account-line">
                            <label htmlFor="new-password2">Retype new password</label>
                            <input type="password" name="new-password2" id="new-password2" placeholder="Retype password" autoComplete="password"></input>
                        </div>
                        {error ? <ErrorMessage text={errorMessage} /> : null}
                        {success ? <SuccessMessage text={successMessage} /> : null}
                        <AuthButton classToDisplay="auth-button-space" form="reset-password" text="Reset password" />
                    </div>
                </form>
            </div> : null}
        </div>
    );
};

export default NewPasswordFromEmail;