import React from 'react';
import {currentUrl} from '../../../services/Mode/Mode';
import ConfirmButtonFormless from '../../../components/Buttons/ConfirmButtonFormless';
import './styles.scss';

const AddBetsHome = (props) => {

    return (
        <div className="add-bets-home-container basic-fx justify-around-fx">
            <div className="left-add-bet-home basic-column-fx align-center-fx justify-around-fx">
                <span className="add-bets-home-title">Create 1 vs 1 bet</span>
                <span className="add-bets-home-text">Each participant bets for himself. It can be between 2 people or as many as there is in your group. Winner takes all.</span>
                <img src={`${currentUrl}/public/general/solo-bet.jpg`} alt="Create solo bets" />
                <ConfirmButtonFormless classToDisplay="confirm-button-space" clickHandler={e => props.handleAddBet(e, "solo")} text="Add solo bet" type="button"/>
            </div>

            <div className="right-add-bet-home basic-column-fx align-center-fx justify-around-fx">
                <span className="add-bets-home-title">Create group bets</span>
                <span className="add-bets-home-text">There are two sides with any number of participants, 3v3, 2x5, whatever you wish. One side can be populated like the streets of Delhi, and the other can be a lone wolf. Your choice. </span>
                <img src={`${currentUrl}/public/general/group-bet.jpg`} alt="Create group bets" />
                <ConfirmButtonFormless classToDisplay="confirm-button-space" clickHandler={e => props.handleAddBet(e, "group")} text="Add group bet" type="button"/>
            </div>
        </div>
    );
};

export default AddBetsHome;