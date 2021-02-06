import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './Utilities';

const JointDroppable = (props) => {

    const[{isOver, canDrop}, drop] = useDrop({
        accept:ItemTypes.CARD,
        canDrop:(item, monitor) => true,
        drop: (item, monitor) => props.itemOnDrop(item,monitor, "jointBet", props.searchIndex),
        collect: monitor => ({
            isOver : !!monitor.isOver(),
            canDrop : !!monitor.canDrop()
        })
    })
    return (
        <div id={props.idToDisplay}
        ref={drop}
        className={`joint-side ${isOver && canDrop ? 'onDropAllowed' : ''}`}
        onDrop={e => props.itemOnDrop(e, "jointBet")}>
            
        {props.jointSelected.length > 0 ? null: 
        <div className="legend-dnd basic-fx justify-center-fx align-center-fx">
            Drag and drop names here
            </div>}
            {props.jointSelected.map(item => {
                return item.id.indexOf(props.searchIndex) !== -1 ?
                    <div key={item.name} id={`${props.divId}${item.name}`} className="joint-not-chosen">
                        {item.name}
                        <span className="delete-joint-participant" onClick={e => props.removeJointParticipant(e, item.name)}>x</span>
                    </div> : null
            })}
    </div>
    );
};

export default JointDroppable;