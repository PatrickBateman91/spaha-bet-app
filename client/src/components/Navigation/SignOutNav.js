import React from 'react';

const SignOutNav = (props) => {

    const authOptions = props.navAuth.map(option => {
        return(
        <div id={option.id} key={option.id} onClick={option.handleNavigationClick}>{option.name}</div>
        )
    })
    return (
        <div className="auth-navigation-container basic-fx justify-center-fx auth-yes" onClick={props.handleNavigationClick}>
            {authOptions}
        </div>
    );
};

export default SignOutNav;