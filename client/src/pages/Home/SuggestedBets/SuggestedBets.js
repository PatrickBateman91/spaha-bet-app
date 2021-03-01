import React from 'react';
import Containers from './Containers';
import Suggestions from './Suggestions';
import './styles.scss';

const SuggestedBets = (props) => {
    return (
        <div className="suggested-bets-container basic-fx justify-between-fx">
           <div className="suggested-left basic-fx align-center-fx">
            {props.selectedCategory ? <Suggestions handleAddPopularBet={props.handleAddPopularBet} suggestions={props.popularBets[props.selectedCategory]} /> : <span className="suggested-title">Pick a bet from popular suggested bets</span>}
           </div>

           <div className="suggested-right basic-fx">
            <Containers changeCategory={props.changeCategory} selectedCategory={props.selectedCategory} />
           </div>
        </div>
    );
};

export default SuggestedBets;