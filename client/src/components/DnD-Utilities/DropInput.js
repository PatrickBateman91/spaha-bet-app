import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './Utilities';

const DropInput = (props) => {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.CARD,
        canDrop: (item, monitor) => true,
        drop: (item, monitor) => props.itemOnDrop(item, monitor, "regularBet", props.itemClicked),
        collect: monitor => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    })

    return (
        <input
            ref={drop}
            className={`${props.classNameToDisplay} ${isOver && canDrop ? 'onDropAllowed' : ''} `}
            onKeyUp={e => props.itemOnKeyUp(e, props.itemClicked)}
            onChange={e => props.itemOnChange(e, 'name')}
            type="text"
            name={props.itemClicked}
            id={props.itemClicked}
            value={props.itemName}
            placeholder="name" />
    );
};

export default DropInput;