import React from 'react';
import AddNewBet from '../../../pages/Bets/AddNewBet/AddNewBet';
import './styles.scss';

const EditBet = (props) => {
    return (
        <div id="modal-container" className="basic-fx justify-center-fx align-center-fx" onClick={props.hideModal} >
            <div id="modal-holder">
                <AddNewBet
                    editMode={true}
                    editId={props.editId}
                    hideModal={props.hideModal}
                    groups={props.groups}
                    selectedGroup={props.selectedGroup}
                    user={props.user}
                />
            </div>
        </div>
    );
};

export default EditBet;