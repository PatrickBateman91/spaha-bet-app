import React, { Fragment } from 'react';
import ConfirmButton from '../../Buttons/ConfirmButton';
import SearchUsers from '../../SearchUsers/SearchUsers';
import Suggestions from '../../SearchUsers/Suggestions';

const InvitePeople = (props) => {
    return (
        <form className="basic-column-fx align-center-fx" name="invite-people-form" onSubmit={props.sendInvites}>
            <div>Selected to invite:</div>
            <div id="new-group-selected-people" className="basic-fx wrap-fx">
                {props.selectedPeople.map(selectedPerson => {
                    return (
                        <div key={selectedPerson} className="relative" >
                            <span className="joint-not-chosen">{selectedPerson}</span>
                            <span className="remove-person" onClick={e => props.addRemoveSuggestion(selectedPerson)}>x</span>
                        </div>
                    )

                })}

                {props.outsiderTrigger ?
                    <Fragment>
                        {props.selectedOutsiders.map(outsider => {
                            return (
                                <span className="relative" key={outsider} >
                                    <span className="joint-not-chosen">{outsider}</span>
                                    <span className="remove-person" onClick={e => props.addRemoveOutsider(outsider)}>x</span>
                                </span>
                            )
                        })}
                    </Fragment> : null}
            </div>

            <span>Invite people to the group</span>
            <div className="basic-fx wrap-fx">
                {props.suggestions.length !== 0 ? props.suggestions.map(suggestion => {
                    if (props.selectedPeople.indexOf(suggestion) === -1) {
                        return (
                            <div key={suggestion} >
                                <span className="not-chosen" onClick={e => props.addRemoveSuggestion(suggestion)}>{suggestion}</span>
                            </div>
                        )
                    } else return null;

                }) : <div className="no-active-members">We have no suggestions for you!</div>}
            </div>

            <SearchUsers handleSuggestions={props.handleSuggestionsFromDatabase} />
            {props.suggestionsTrigger ? <Suggestions addRemoveOutsider={props.addRemoveOutsider} suggestionsFromDatabase={props.suggestionsFromDatabase} /> : null}
            <ConfirmButton classToDisplay="basic-fx justify-center-fx confirm-button-space" text="Send invites" type="submit" />
        </form>
    );
};

export default InvitePeople;