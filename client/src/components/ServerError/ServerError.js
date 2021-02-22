import React from 'react';
import './styles.scss';

const ServerError = (props) => {
    return (
        <div className="server-error-container basic-fx justify-center-fx align-center-fx">
            <div className="server-error-holder basic-fx justify-center-fx align-center-fx">
                <span>{props.message}</span>
            </div>
        </div>
    );
};

export default ServerError;