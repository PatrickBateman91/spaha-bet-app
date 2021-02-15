import React from 'react';
import ChangeGroupName from '../../../components/Groups/ManageGroups/ChangeGroupName';
import ChangeDataLayout from './ChangeDataLayout';
import InvitePeople from '../../../components/Groups/ManageGroups/InvitePeople';
import LeaveDeleteGroup from '../../../components/Groups/ManageGroups/LeaveDeleteGroup';
import RemovePeople from '../../../components/Groups/ManageGroups/RemovePeople';
import './styles.scss';

const ManageGroupsModal = (props) => {
    let changeModal;
    if (props.whichModal === "leave-group") {
        changeModal = (
            <LeaveDeleteGroup
                buttonText="Leave group"
                deleteGroup={false}
                doubleCheckText="leave this"
                handleCheckbox={props.handleCheckbox}
                handleLeaveDelete={props.handleLeaveDelete}
                noteText="All your bets from this group will be deleted!"
                question="Are you sure you want to leave this group?"
                warningCheck={props.warningCheck}
            />
        )
    } else if (props.whichModal === "delete-group") {
        changeModal = (
            <LeaveDeleteGroup
                buttonText="Delete group"
                deleteGroup={true}
                doubleCheckText="delete this"
                handleCheckbox={props.handleCheckbox}
                handleLeaveDelete={props.handleLeaveDelete}
                noteText="All the bets inside the group will be deleted!"
                question="Are you sure you want to delete this group?"
                warningCheck={props.warningCheck}
            />
        )
    } else if (props.whichModal === "edit-group-name") {
        changeModal = (
            <ChangeGroupName hideMessages={props.hideMessages} handleChangeGroupName={props.handleChangeGroupName} />
        )
    } else if (props.whichModal === "invite-people") {
        changeModal = (
            <InvitePeople
                addRemoveOutsider={props.addRemoveOutsider}
                addRemoveSuggestion={props.addRemoveSuggestion}
                handleSuggestionsFromDatabase={props.handleSuggestionsFromDatabase}
                outsiderTrigger={props.outsiderTrigger}
                selectedPeople={props.selectedPeople}
                selectedOutsiders={props.selectedOutsiders}
                sendInvites={props.sendInvites}
                suggestions={props.suggestions}
                suggestionsFromDatabase={props.suggestionsFromDatabase}
                suggestionsTrigger={props.suggestionsTrigger}
            />)
    } else if (props.whichModal === "remove-people") {
        changeModal = (
            <RemovePeople
                addRemoveExistingMember={props.addRemoveExistingMember}
                handleRemoveMembers={props.handleRemoveMembers}
                people={props.people}
                peopleToRemove={props.peopleToRemove} />
        )
    }

    if (props.whichModal !== "" && props.whichModal !== undefined) {
        return (
            <ChangeDataLayout id={`${props.whichModal !== "edit-group-name" ? "change-modal" : ""}`}>
                {changeModal}
            </ChangeDataLayout>
        );
    } else {
        return (
            <ChangeDataLayout classToDisplay="empty-change-account-div justify-center-fx align-center-fx">
                <span>What would you like to change?</span>
            </ChangeDataLayout>
        );
    }
};

export default ManageGroupsModal;