import React, { Fragment } from 'react';
import { getDate} from '../../DumbComponents/SimpleFunctions';
import {currentUrl} from '../../MISC/Mode';
import ApproveBox from '../../MISC/ApproveBox';

const Notifications = (props) => {
        let unseenToRender, seenToRender;
        const unseenNotifications = props.user.notifications.filter(item => item.seen === false);
        const seenNotifications = props.user.notifications.filter(item => item.seen === true);
        
        seenNotifications.sort((a, b) =>{
            const aDate = new Date(a.timestamp);
            const bDate = new Date(b.timestamp);
            return bDate - aDate;
        });
        unseenNotifications.sort((a, b) =>{
            const aDate = new Date(a.timestamp);
            const bDate = new Date(b.timestamp);
            return bDate - aDate;
        });

        let unseenTrigger = false;
        let seenTrigger = false;

        seenToRender = seenNotifications.map((notification, index) => {
            seenTrigger = true;
                const newDate = getDate(1, notification.timestamp)
                return (
                    <div key={notification.title + index} className="notification-item basic-fx justify-evenly-fx align-center-fx">
                            <span className="notification-date">{newDate} </span>
                            <div className="notification-body"><span>{notification.title}</span></div>
                    </div>)
        })
        unseenToRender = unseenNotifications.map((notification, index) => {
                unseenTrigger = true;
                const newDate = getDate(1, notification.timestamp)
                return (
                    <Fragment key={notification.title + index}>
                    <div className="notification-item basic-fx justify-evenly-fx bold align-center-fx">
                     <span className="notification-date">{newDate} </span>
                     <div className="notification-body">
                     <span className="menu-notification">NEW</span>
                     <span>{notification.title}</span>
                     </div>
                    </div>
                {
                notification.needsResolving ? <div className="notification-approval-container basic-fx justify-center-fx"><ApproveBox handleApproval={props.handleNotificationApproval} notification={notification} /> </div>: null
                }
                <div className="basic-fx justify-center-fx"><div className="bottom-line"></div></div>
                </Fragment>)
        })
    return (
       
        <div id="notification-container" className="basic-column-fx align-center-fx">
            <div id="notification-holder" className="basic-column-fx">
                <div id="notification-title">Notifications:</div>
            <Fragment>
                <div id="newer-notifications-holder">
                {unseenTrigger ? unseenToRender : null}
                {!unseenTrigger && !seenTrigger ? <span>You have no notifications</span> : null}
                </div>
                <div id="older-notifications-holder" className="basic-column-fx wrap-fx">
               {seenTrigger ? <span className="older-notifications-title">Older notifications:</span> : null}
                {seenTrigger ? seenToRender : null}
                </div>
            </Fragment>
            </div>
            <div className="home-paper-pin-container">
                <div>
                    <img src={`${currentUrl}/public/general/paper-pin.png`}  alt="paper-pin"/>
                </div>
            </div>
           </div>
     );
  }



export default Notifications;