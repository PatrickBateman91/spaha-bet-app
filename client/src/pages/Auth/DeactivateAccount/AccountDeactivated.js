import React from 'react';
import './styles.scss';

const AccountDeactivated = (props) => {
    window.scrollTo(0, 0);
    document.getElementById('root').style.height = "100%";
    setTimeout(() => window.location.replace("https://spaha-betapp.netlify.app"), 2000);
    return (
        <div className="main-container main-background basic-fx align-center-fx justify-center-fx">
            <div id="goodbye-container" className="basic-column-fx justify-around-fx align-center-fx">
                <div>Your account has been deleted.</div>
                <div>Come back any time!</div>
                <span>redirecting you to home page...</span>
            </div>
        </div>
    );
};

export default AccountDeactivated;