import React, { Fragment } from 'react';
import DropInput from '../DnD-Utilities/DropInput';
import DraggableName from '../DnD-Utilities/DraggableName';
import './styles.scss';

const RegularParticipants = (props) => {
    return (
        <Fragment>
            <div className="full-line-center basic-fx justify-between-fx">
                <DropInput
                    classNameToDisplay="participant-input-name"
                    itemOnKeyUp={props.nameType}
                    itemClicked={`newBetParticipant${props.index + 1}`}
                    itemOnDrop={props.drop}
                    itemOnChange={props.settingParticipants}
                    id={`newBetParticipant${props.index + 1}`}
                    itemName={props.item.name}
                    placeholder="nickname" />

                <input type="text"
                    name={`newBetParticipantValue${props.index + 1}`}
                    id={`newBetParticipantValue${props.index + 1}`}
                    value={props.item.value}
                    onChange={e => props.settingParticipants(e, 'value')}
                    placeholder="says..." />

                <input type={props.moneyClicked ? "number" : "text"}
                    name={`newBetParticipantStake${props.index + 1}`}
                    id={`newBetParticipantStake${props.index + 1}`}
                    onChange={e => props.settingParticipants(e, 'stake')}
                    value={props.equalBets ? props.item.singleStake : ""}
                    placeholder={props.equalBets ? props.moneyClicked ? "bet / how much money?" : "bet / in what?" : null}
                    disabled={!props.equalBets} />

                {props.participants.length > 2 ? <span className="removeAdditionalClauseOrParticipant" onClick={props.removeParticipant}>x</span> : null}

            </div>
            {props.people.map(person => {
                let check = props.alreadyExistsCheck(person, "regular");
                if (check === false) {
                    return (
                        <DraggableName
                            classNameToDisplay="not-chosen"
                            id={`${props.item.id}${person}`}
                            key={person}
                            person={person}
                            itemOnClick={props.addSuggestion}
                            itemClicked={`newBetParticipant${props.index + 1}`}
                        />
                    )
                }
                else {
                    return null
                };

            })}
        </Fragment>
    );
};

export default RegularParticipants;