import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCopy, faUserMinus, faTrash } from '@fortawesome/free-solid-svg-icons';

const GroupLine = (props) => {
    return (
        <div className={`basic-fx justify-center-fx group-line relative ${props.selectedLine ? "group-line-selected" : ""}`} onClick={e => props.handleChange(e, e.target.id, props.id)}>
            <div id="group-line-container" className="line-width basic-fx justify-between-fx">
                <div className="line-width group-name basic-fx align-center-fx">{props.groupName}</div>

                <div className="line-width basic-fx justify-center-fx align-center-fx relative">
                    <div className="group-line-invite" id="invite-people">INVITE</div>
                </div>

                {props.admin ?
                    <div className="line-width basic-fx justify-center-fx align-center-fx relative">
                        <span className="group-line-remove" id="remove-people">REMOVE</span>
                    </div> : <div className="line-width"></div>}

                <div className="basic-fx justify-center-fx align-center-fx line-svg line-width">
                    {props.admin ?
                        <div id="change-group-name" className="relative">
                            <div className="manage-groups-mouseover display-none" id={`edit-group-name-${props.id}`}></div>
                            <FontAwesomeIcon
                                icon={faEdit}
                                onMouseEnter={e => props.handleMouseOver(e, "edit-group-name", props.id)}
                                onMouseLeave={e => props.handleMouseOver(e, "edit-group-name", props.id)}
                                onClick={e => props.handleChange(e, "edit-group-name", props.id)} />
                        </div> : <div className="line-width"></div>}
                </div>

                <div className="line-width basic-fx justify-center-fx align-center-fx">
                    <input type="text" id={`copy-id-input-field-${props.id}`} className="copy-id" readOnly={true} value={props.id} />
                </div>

                <div className="basic-fx justify-center-fx align-center-fx line-svg line-width relative">
                    <div className="manage-groups-mouseover display-none" id={`copy-id-${props.id}`}></div>
                    <FontAwesomeIcon
                        icon={faCopy}
                        onMouseEnter={e => props.handleMouseOver(e, "copy-id", props.id)}
                        onMouseLeave={e => props.handleMouseOver(e, "copy-id", props.id)}
                        onClick={e => props.handleChange(e, "copy-id", props.id)} />
                </div>

                <div className="basic-fx justify-center-fx align-center-fx line-svg line-width relative">
                    <div className="manage-groups-mouseover display-none" id={`leave-group-${props.id}`}></div>
                    <FontAwesomeIcon
                        icon={faUserMinus}
                        onMouseEnter={e => props.handleMouseOver(e, "leave-group", props.id)}
                        onMouseLeave={e => props.handleMouseOver(e, "leave-group", props.id)}
                        onClick={e => props.handleChange(e, "leave-group", props.id)} />
                </div>

                <div className="basic-fx justify-center-fx align-center-fx line-svg line-width relative">
                    <div className="manage-groups-mouseover display-none" id={`delete-group-${props.id}`}></div>
                    {props.admin ?
                        <FontAwesomeIcon
                            onMouseEnter={e => props.handleMouseOver(e, "delete-group", props.id)}
                            onMouseLeave={e => props.handleMouseOver(e, "delete-group", props.id)}
                            icon={faTrash}
                            onClick={e => props.handleChange(e, "delete-group", props.id)} />
                        : <div className="line-width"></div>}
                </div>
            </div>
        </div>
    );
};

export default GroupLine;