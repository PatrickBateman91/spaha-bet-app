import React from 'react';
import {getUserData} from '../Axios/UserRequests';
const AccountDeactivated = (props) => {
    const getUserPromise = getUserData('get user');
    getUserPromise.then(res => {
      props.history.push('/');
    }).catch(err => {
        setTimeout(() => props.history.push('/'), 1500)
    })
    return (
        <div className="main-container main-background basic-fx align-center-fx justify-center-fx">
            <div id="goodbye-container"  className="basic-column-fx justify-around-fx align-center-fx">
            <div>Your account has been deleted.</div>
         <div>Come back any time!</div>    
         <span>redirecting you to home page...</span>
            </div>

        </div>
    );
};

export default AccountDeactivated;