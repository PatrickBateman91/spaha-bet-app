import React from 'react';
import LeaveDeleteGroup from './LeaveDeleteGroup';
import ChangeGroupName from './ChangeGroupName';
import InvitePeople from './InvitePeople';
import RemovePeople from './RemovePeople';

const ManageGroupsModal = (props) => {
let changeModal;
    if(props.whichModal === "leave-group"){
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
    } else if(props.whichModal === "delete-group"){
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
    } else if(props.whichModal === "edit-group-name"){
        changeModal = (
            <ChangeGroupName hideMessages={props.hideMessages} handleChangeGroupName={props.handleChangeGroupName}/>
        )
    } else if(props.whichModal === "invite-people"){
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
    } else if(props.whichModal === "remove-people"){
        changeModal = (
            <RemovePeople 
            addRemoveExistingMember={props.addRemoveExistingMember}
            handleRemoveMembers={props.handleRemoveMembers}
            people={props.people} 
            peopleToRemove={props.peopleToRemove}/>
        )
    }

    if(props.whichModal !== "" && props.whichModal !== undefined){
        return (
            <div className="basic-column-fx" id={`${props.whichModal !== "edit-group-name" ? "change-modal" : ""}`}>
               {changeModal}
            </div>
        );
    } else{
        return (
                <div className="empty-change-account-div basic-fx align-center-fx justify-center-fx">
                <span>What would you like to change?</span>
              </div>
        );
    }
};

export default ManageGroupsModal;