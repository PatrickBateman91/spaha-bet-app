import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { joinNewGroupRequest } from '../../../services/Axios/GroupRequests';
import { returnToMain, windowWidth as usingMobile } from '../../../services/HelperFunctions/HelperFunctions';
import ConfirmButton from '../../../components/Buttons/ConfirmButton';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import SuccessModal from '../../../components/Modals/SuccessModal';
import './styles.scss';

const JoinNewGroup = (props) => {
    window.scrollTo(0, 0);
    document.getElementById('root').style.height = "100%";

    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [pageLoaded, setPageLoaded] = useState(false);

    useEffect(() => {
        if (props.appLoaded) {
            if (props.user.guest === "guest") {
                props.history.push('/');
            } else {
                setPageLoaded(true);
            }
        }
    }, [props.history, props.appLoaded, props.user.guest])

    const hideMessages = () => {
        setError(false);
        setSuccess(false);
    }

    const joinNewGroupFunction = (e) => {
        e.preventDefault();
        const id = document.getElementById('join-new-group').value;
        if (id !== "") {
            const joinNewGroupPromise = joinNewGroupRequest(id);
            joinNewGroupPromise.then(res => {
                setSuccessMessage('Your join request has been sent to group admin!')
                setSuccess(true);
                setTimeout(() => props.history.push('/'), 1000)
            }).catch(err => {
                setErrorMessage(err.response.data.message);
                setError(true);
            })
        }
    }

    return (
        <div className={`basic-column-fx justify-center-fx align-center-fx main-container ${usingMobile(480) ? "gradient-background" : "alternative-mobile-background"}`}>
            <form id="join-new-group-form" onSubmit={joinNewGroupFunction}>
                {pageLoaded ?
                    <div className="join-new-group basic-column-fx justify-around-fx">
                        <div className="joint-new-group-body basic-column-fx justify-between-fx">
                            <label htmlFor="join-new-group">Enter the ID of the group you want to join:</label>
                            <input
                                onChange={hideMessages}
                                type="text"
                                name="join-new-group"
                                id="join-new-group"
                                placeholder="Enter group ID"
                                autoComplete="Group id"
                            ></input>
                            {error ? <ErrorMessage text={errorMessage} /> : null}
                            <ConfirmButton classToDisplay="basic-fx justify-center-fx confirm-button-space" form="join-new-group-form" text="Join group" type="submit" />
                        </div>
                    </div> : null}
            </form>
            <ReturnButton classToDisplay="justify-center-fx return-button-space return-button-medium" returnToMain={returnToMain.bind(null, props)} text="Main menu" />
            {success ? <SuccessModal message={successMessage} /> : null}
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        appLoaded: state.appStates.appLoaded,
        user: state.user
    }
}

export default connect(mapStateToProps, null)(JoinNewGroup);