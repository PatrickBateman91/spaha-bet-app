import React from 'react';

const InvitePeople = (props) => {
    return (
        <div className="basic-column-fx align-center-fx">
            <div>Selected to invite:</div>
            <div id="new-group-selected-people" className="basic-fx wrap-fx">
                <div>
                    {props.selectedPeople.map(selectedPerson => {
                        return (
                            <div key={selectedPerson} className="relative" >
                                <span className="joint-not-chosen">{selectedPerson}</span>
                                <span className="remove-person" onClick={e => props.addRemoveSuggestion(selectedPerson)}>x</span>
                            </div>
                        )

                    })}
                </div>

                {props.outsiderTrigger ?
                    <div>
                        {props.selectedOutsiders.map(outsider => {
                            return (
                                <span className="relative" key={outsider} >
                                    <span className="joint-not-chosen">{outsider}</span>
                                    <span className="remove-person" onClick={e => props.addRemoveOutsider(outsider)}>x</span>
                                </span>
                            )
                        })}
                    </div> : null}
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

            <div id="search-users-container" className="basic-fx justify-between-fx">
                <label htmlFor="search-users">Someone else?</label>
                <input
                    type="text"
                    name="search-users"
                    id="search-users-to-add"
                    placeholder="Search database for users to add"
                    autoComplete="nickname"
                    onChange={props.handleSuggestionsFromDatabase}
                ></input>
            </div>
            {props.suggestionsTrigger ?
                <div className="search-holder basic-column-fx align-center-fx">
                    {props.suggestionsFromDatabase.map(suggestion => {
                        return (
                            <div id="search-line" key={suggestion} className="basic-fx justify-between-fx align-center-fx">
                                <span className="not-chosen" >
                                    {suggestion}
                                </span>
                                <span className="search-add" onClick={e => props.addRemoveOutsider(suggestion)}>ADD</span>
                            </div>
                        )
                    })}
                </div> : null}
                <div id="add-bet-button-container" className="basic-fx justify-center-fx">
                    <button type="submit" onClick={props.sendInvites}>Send invites</button>
                    </div>
        </div>
    );
};

export default InvitePeople;