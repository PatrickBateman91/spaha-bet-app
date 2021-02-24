import React, { Fragment } from 'react';
import { getDate } from '../../services/HelperFunctions/HelperFunctions';
import { currentUrl } from '../../services/Mode/Mode';
import SeenNotification from '../../components/Notifications/SeenNotification';
import UnseenNotification from '../../components/Notifications/UnseenNotification';
import './styles.scss';

const Notifications = (props) => {
    let unseenToRender, seenToRender;
    const unseenNotifications = props.user.notifications.filter(item => item.seen === false);
    const seenNotifications = props.user.notifications.filter(item => item.seen === true);

    seenNotifications.sort((a, b) => {
        const aDate = new Date(a.timestamp);
        const bDate = new Date(b.timestamp);
        return bDate - aDate;
    });
    unseenNotifications.sort((a, b) => {
        const aDate = new Date(a.timestamp);
        const bDate = new Date(b.timestamp);
        return bDate - aDate;
    });

    let unseenTrigger = false;
    let seenTrigger = false;

    seenToRender = seenNotifications.map((notification, index) => {
        seenTrigger = true;
        if(!props.showNotifications){
            if(index < 5){
                const newDate = getDate(1, notification.timestamp)
                return (
                    <SeenNotification date={newDate} key={notification.title + index} title={notification.title} />
                )
            } else return null;
        } else{
            const newDate = getDate(1, notification.timestamp)
            return (
                <SeenNotification date={newDate} key={notification.title + index} title={notification.title} />
            )
        }   
    })
    unseenToRender = unseenNotifications.map((notification, index) => {
        unseenTrigger = true;
        const newDate = getDate(1, notification.timestamp)
        return (
            <UnseenNotification date={newDate} handleApproval={props.handleNotificationApproval} key={notification.title + index} notification={notification} />
        )
    })
    return (
        <div id="notification-container" className="basic-column-fx align-center-fx">
            <div id="notification-holder" className="basic-column-fx">
                <div id="notification-title">Notifications</div>
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
            {seenToRender.length > 5 ? <div className="show-more-notifications-container basic-fx justify-center-fx align-center-fx" onClick={props.handleShowNotifications}>
                    <div className="show-more-notifications-holder">Show {props.showNotifications ? "less" : "more"} notifications</div>
                </div> : null}
            </div>
            <div className="home-paper-pin-container">
                <div>
                    <img src={`${currentUrl}/public/general/paper-pin.png`} alt="paper-pin" />
                </div>
            </div>
        </div>
    );
}



export default Notifications;