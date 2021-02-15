import React from 'react';
import ConfirmButton from '../../Buttons/ConfirmButton';

const RemovePeople = (props) => {
    return (
        <div className="basic-column-fx align-center-fx">
            Members to be removed:
            <div id="new-group-selected-people" className="basic-fx wrap-fx">
                {props.peopleToRemove.map(personToRemove => {
                    return (<div key={personToRemove}>
                        <div className="relative" onClick={e => props.addRemoveExistingMember(personToRemove)} >
                            <span className="removed-single-person">{personToRemove}</span>
                            <span className="remove-person">x</span>
                        </div>
                    </div>
                    )
                })}
            </div>
            <form name="remove-people-form" onSubmit={props.handleRemoveMembers}>
                <div className="basic-column-fx wrap-fx">
                    <div className="text-center"> Existing members:</div>
                    <div className="basic-fx wrap-fx">
                        {props.people.length !== 0 ? props.people.map(member => {
                            if (props.peopleToRemove.indexOf(member) === -1) {
                                return (
                                    <div key={member} className="relative" onClick={e => props.addRemoveExistingMember(member)}>
                                        <span className="about-to-be-removed">{member}</span>
                                        <span className="remove-person">x</span>
                                    </div>
                                )
                            } else return null;
                        }) : <div className="red-color give-space-medium">There are no members in the group!</div>}

                    </div>
                </div>
                <ConfirmButton classToDisplay="basic-fx justify-center-fx confirm-button-space" text="Remove members" type="submit" />
            </form>
        </div>
    );
};

export default RemovePeople;