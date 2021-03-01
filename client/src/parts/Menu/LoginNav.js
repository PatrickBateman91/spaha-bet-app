import React, {Fragment} from 'react';
import './styles.scss';

const LoginNav = (props) => {
    const nonAuthOptions = props.navNonAuth.map(option => {
        return (
            <div id={option.id} key={option.id} onClick={e => props.reDirect(e, `/${option.id}`)}>{option.name}</div>
        )
    })
    return (
        <Fragment>
            {nonAuthOptions}
         </Fragment>
    );
};

export default LoginNav;