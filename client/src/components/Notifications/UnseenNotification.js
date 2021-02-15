import React, { Fragment } from 'react';
import ApproveBox from '../ApproveBox/ApproveBox';
import './styles.scss';

const UnseenNotification = (props) => {
    return (
        <Fragment>
            <div className="notification-item basic-fx justify-evenly-fx bold align-center-fx">
                <span className="notification-date">{props.date} </span>
                <div className="notification-body">
                    <span className="red-color">NEW</span>
                    <span>{props.notification.title}</span>
                </div>
            </div>
            {
                props.notification.needsResolving ? <div className="notification-approval-container basic-fx justify-center-fx">
                    <ApproveBox handleApproval={props.handleApproval} notification={props.notification} /> </div> : null
            }
            <div className="basic-fx justify-center-fx"><div className="bottom-line"></div></div>
        </Fragment>
    );
};

export default UnseenNotification;