import React from 'react';
import './styles.scss';

const SignOutNav = (props) => {

    const authOptions = props.navAuth.map(option => {
        return (
            <div id={option.id} key={option.id}>{option.name}</div>
        )
    })
    return (
        <div className="auth-navigation-container basic-fx justify-center-fx profile-info-button" onClick={ e => props.reDirect(e, "/sign-out")}>
            {authOptions}
        </div>
    );
};

export default SignOutNav;