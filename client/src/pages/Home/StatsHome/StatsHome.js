import React from 'react';
import {Link} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight} from '@fortawesome/free-solid-svg-icons';
import './styles.scss';

const StatsHome = () => {
    return (
        <div className="stats-home-container">
            <div className="stats-home-holder basic-column-fx justify-around-fx">
            <span className="stats-home-title">Check out stats</span>
            <span className="stats-home-text">Who cares man, who even keeps track? Well, we do. Every group has its own bets statistics. See how many bets have you won, how much money you earned and more.</span>
            <Link to="/stats"><div className="stats-home-link"><span>Go to stats</span> <FontAwesomeIcon icon={faArrowRight}/></div></Link>
            </div>
        </div>
    );
};

export default StatsHome;