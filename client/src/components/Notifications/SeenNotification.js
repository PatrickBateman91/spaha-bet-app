import React from 'react';
import './styles.scss';

const SeenNotification = (props) => {
    return (
        <div className="notification-item basic-fx justify-evenly-fx align-center-fx">
            <span className="notification-date">{props.date} </span>
            <div className="notification-body"><span>{props.title}</span></div>
        </div>
    );
};

export default SeenNotification;