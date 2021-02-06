import React from 'react';
import {currentUrl} from '../MISC/Mode';

const MenuManageGroups = (props) => {
    return (
        <div id="manage-groups-container"  >
            <div id="manage-group-title" className={"basic-fx justify-center-fx align-center-fx"}>
                Manage your groups
            </div>
            <div className="basic-fx wrap-fx justify-between-fx align-center-fx" id="manage-groups-body" onClick={props.menuClick}>
                <div className="basic-fx align-center-fx justify-center-fx"><span>Create new group</span><img src={`${currentUrl}/public/general/red-sticky-note.png`} alt="red sticky note"/></div>
                <div className="basic-fx align-center-fx justify-center-fx"><span>Join existing group</span><img src={`${currentUrl}/public/general/red-sticky-note.png`} alt="red sticky note"/></div>
                <div className="basic-fx align-center-fx justify-center-fx"><span>Manage your groups</span><img src={`${currentUrl}/public/general/red-sticky-note.png`} alt="red sticky note"/></div>
            </div>
            <div className="home-paper-pin-container">
                <div>
                    <img src='https://spaha-bets.herokuapp.com/public/general/paper-pin.png'  alt="paper-pin"/>
                </div>
            </div>
        </div>
    );
};

export default MenuManageGroups;