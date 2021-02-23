import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useDrop } from 'react-dnd';
import './styles.scss';


const UploadPicture = (props) => {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: NativeTypes.FILE,
        canDrop: (item, monitor) => true,
        drop: (item, monitor) => props.handlePictureDrop(item, monitor),
        collect: monitor => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    })

    return (
        <div
            onDrop={props.handlePictureDrop}
            ref={drop}
            className={`basic-column-fx justify-center-fx align-center-fx upload-picture-form  ${isOver && canDrop ? 'onDropAllowed' : ''}`}
        >
            <label className="basic-column-fx justify-around-fx align-center-fx upload-icon-container" htmlFor={props.id}>{props.labelText}
                <div><FontAwesomeIcon icon={faUpload} /></div>
                <div className="selected-file">{props.selectedFile}</div>
            </label>
            <input
                type="file"
                accept="image/x-png,image/jpg,image/jpeg"
                onChange={props.handleProfilePicture}
                name={props.id} id={props.id}
            />
        </div>
    );
};

export default UploadPicture;