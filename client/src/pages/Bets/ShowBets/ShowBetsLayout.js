import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import GroupsDropdown from '../../../components/Groups/GroupsDropdown/GroupsDropdown';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import { returnToMain } from '../../../services/HelperFunctions/HelperFunctions';

const ShowBetsLayout = (props) => {
    return (
        <div className="main-container">
            <div className="all-bets-container basic-column-fx wrap-fx align-center-fx" onClick={props.closeModals}>
                {props.pageLoaded ?
                    <Fragment>
                        <div className={`upper-bet-container ${props.bets.length > 0 ? "upper-bet-full" : "upper-bet-empty"}`}>
                            <div id="active-bets-group-container" className="relative">
                                <GroupsDropdown
                                    groups={props.groups}
                                    groupsOpen={props.groupsOpen}
                                    handleGroupModal={props.handleGroupModal}
                                    handleGroupChange={props.handleGroupChange}
                                    selectedGroup={props.selectedGroup}
                                    selectedGroupName={props.selectedGroupName}
                                />
                            </div>
                            {props.trigger ? <ReturnButton classToDisplay="return-button-small" returnToMain={returnToMain.bind(null, props)} text="Main menu" /> : null}
                        </div>
                        {props.children}
                        <ReturnButton classToDisplay="return-button-medium" returnToMain={returnToMain.bind(null, props)} text="Main menu" />
                    </Fragment> : null}
            </div>
        </div>
    );
};

export default withRouter(ShowBetsLayout);