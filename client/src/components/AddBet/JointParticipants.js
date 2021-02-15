import React, { Fragment } from 'react';
import DraggableName from '../DnD-Utilities/DraggableName';
import JointDroppable from '../DnD-Utilities/JointDroppable';
import './styles.scss';

const JointParticipants = (props) => {
    return (
        <Fragment>
            <div id="joint-bet-container" className="basic-fx wrap-fx">

                <JointDroppable
                    idToDisplay="left-joint-side"
                    itemOnDrop={props.drop}
                    jointSelected={props.jointSelected}
                    searchIndex="left"
                    divId={"left-joint-"}
                    removeJointParticipant={props.removeJointParticipant}
                />

                <JointDroppable
                    idToDisplay="right-joint-side"
                    itemOnDrop={props.drop}
                    jointSelected={props.jointSelected}
                    searchIndex="right"
                    divId={"right-joint-"}
                    removeJointParticipant={props.removeJointParticipant}
                />
            </div>

            <div id="joint-bet-inputs-container" className="basic-fx">
                <div className="input-joint-side">
                    <input id="joint-left-side-input1" type="text" placeholder="left side says what" />
                    <input id="joint-left-side-input2" type="text" placeholder="amount" />
                </div>
                <div className="input-joint-side">
                    <input id="joint-right-side-input1" type="text" placeholder="amount" />
                    <input id="joint-right-side-input2" type="text" placeholder="right side says what" />
                </div>
            </div>

            <div id="joint-bet-names-suggestions" className="basic-fx wrap-fx">
                {props.people.map(person => {
                    let check = props.alreadyExistsCheck(person, "joint");
                    if (check === false) {
                        return (
                            <DraggableName
                                classNameToDisplay="not-chosen"
                                id={`jointBet${person}`}
                                key={person}
                                person={person}
                                itemOnClick={e => false}
                            />
                        )
                    }
                    else {
                        return null
                    };
                })}
            </div>
        </Fragment>
    );
};

export default JointParticipants;