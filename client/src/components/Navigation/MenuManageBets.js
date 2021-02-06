import React from 'react';
import {currentUrl} from '../MISC/Mode';

const MenuManageBets = (props) => {
    return (
        <div id="manage-bets-container" >
            <div id="manage-bets-title" className={"basic-fx justify-center-fx align-center-fx"}>
                Manage your bets
            </div>
            <div className="basic-fx wrap-fx justify-between-fx" id="manage-bets-body" onClick={props.menuClick}>
                <div className="basic-fx align-center-fx justify-center-fx"><span>Add new bet</span><img src={`${currentUrl}/public/general/green-sticky-note.png`} alt="green sticky note"/></div>
                <div className="basic-fx align-center-fx justify-center-fx"><span>View all active bets</span><img src={`${currentUrl}/public/general/green-sticky-note.png`} alt="green sticky note"/></div>
                <div className="basic-fx align-center-fx justify-center-fx"><span>View all finished bets</span><img src={`${currentUrl}/public/general/green-sticky-note.png`} alt="green sticky note"/></div>
    <div className="basic-fx align-center-fx justify-center-fx" id="approve-bets-container">
        <span id="approve-bets">Approve bets <span className="red-color bold notification-number">({props.notifications})</span></span><img src={`${currentUrl}/public/general/green-sticky-note.png`} alt="green sticky note"/></div>
            </div>
            <div className="home-paper-pin-container">
                <div>
                    <img src='https://spaha-bets.herokuapp.com/public/general/paper-pin.png'  alt="paper-pin"/>
                </div>
            </div>
        </div>

    );
};

export default MenuManageBets;