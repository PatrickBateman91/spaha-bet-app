import React from 'react';

const LoginNav = (props) => {
    const nonAuthOptions = props.navNonAuth.map(option => {
        return(
        <div id={option.id} key={option.id}>{option.name}</div>
        )
    })
    return (
        <div className="auth-navigation-container auth-non" onClick={props.handleNavigationClick}>
          {nonAuthOptions}
        </div>
    );
};

export default LoginNav;