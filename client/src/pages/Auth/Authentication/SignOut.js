import React, { Fragment, useState } from 'react';
import { signOutRequest } from '../../../services/Axios/UserRequests';
import './styles.scss';

const SignedOutPage = (props) => {
    const [success, setSuccess] = useState(false);
    const [errorMessage, setMessage] = useState("");
    const signOutPromise = signOutRequest();
    signOutPromise.then(res => {
        setSuccess(true);
        setTimeout(() => props.history.push('/'), 1000)
    }).catch(err => {
        setMessage('Something went wrong with! Redirecting you to Home page.')
        setTimeout(() => props.history.push('/'), 1000)
    })
    return (
        <Fragment>
            {success ? <div className="basic-fx justify-center-fx align-center-fx sign-out-page">
                You have been signed out successfully!
                Redirecting to Home page...
        </div> :
                <div className="basic-fx justify-center-fx align-center-fx sign-out-page">{errorMessage}</div>}
        </Fragment>
    );
};

export default SignedOutPage;