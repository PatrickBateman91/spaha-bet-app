import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretSquareDown, faCaretSquareUp } from '@fortawesome/free-solid-svg-icons';
import './styles.scss';

const GroupsDropdown = (props) => {
  const groupTrigger = props.groups.length > 0;
  const otherGroups = props.groups.map((group, idx) => {
    return (
      <div className="other-group-item" key={group.name + idx}>
        {group.name}
      </div>
    )
  })

  return (
    <Fragment>
      {groupTrigger ? <div id="currently-selected-group" className="basic-fx justify-evenly-fx align-center-fx relative" onClick={props.handleGroupModal}>
        <span>{props.selectedGroupName}</span>
        {props.groupsOpen ? <FontAwesomeIcon icon={faCaretSquareUp} /> : <FontAwesomeIcon icon={faCaretSquareDown} />}
      </div>
        : null}
      {props.groupsOpen && groupTrigger ? <div id="other-groups-container" onClick={props.handleGroupChange}>
        {otherGroups}
      </div> : null}

    </Fragment>
  );
}


export default GroupsDropdown;