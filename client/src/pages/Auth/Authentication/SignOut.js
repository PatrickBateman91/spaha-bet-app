import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { signOutRequest } from '../../../services/Axios/UserRequests';
import './styles.scss';

const SignedOutPage = (props) => {
    window.scrollTo(0, 0);
    document.getElementById('root').style.height = "100%";
    const [success, setSuccess] = useState(false);
    const [errorMessage, setMessage] = useState("");

    const signOutPromise = signOutRequest();
    signOutPromise.then(userResponse => {
        props.emptyGroups();
        props.logOutUser();
        props.revertToDefault();
        props.setAppLoaded(true);
        setSuccess(true);
        setTimeout(() => props.history.push('/'), 1000)
    }).catch(err => {
        setMessage('Something went wrong with! Redirecting you to Home page.')
        setTimeout(() => props.history.push('/'), 1000)
    })

    return (
        <Fragment>
            {success ? <div className="basic-fx justify-center-fx align-center-fx sign-out-page gradient-background">
                You have been signed out successfully!
                Redirecting to Home page...
        </div> :
                <div className="basic-fx justify-center-fx align-center-fx sign-out-page">{errorMessage}</div>}
        </Fragment>
    );
};

const mapDispatchToProps = (dispatch) => {
    return {
        emptyGroups: () => {
            dispatch({ type: 'groups/emptyGroups' })
        },

        logOutUser: () => {
            dispatch({ type: 'user/logOutUser' })
        },

        revertToDefault: () => {
            dispatch({ type: 'appStates/revertToDefault' })
        },

        setAppLoaded: (bool) => {
            dispatch({ type: "appStates/setAppLoaded", payload: bool })
        }
    }
}

export default connect(null, mapDispatchToProps)(SignedOutPage)