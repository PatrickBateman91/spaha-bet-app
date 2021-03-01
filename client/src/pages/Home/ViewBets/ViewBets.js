import React from 'react';
import {Link} from 'react-router-dom';
import {currentUrl} from '../../../services/Mode/Mode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight} from '@fortawesome/free-solid-svg-icons';
import './styles.scss';

const ViewBets = (props) => {
    return (
        <div className="view-bets-home-container basic-column-fx align-center-fx">
            <div className="view-bets-body basic-fx justify-between-fx">
                <div className="view-bets-home-image-container">
                <img src={`${currentUrl}/public/general/active-bets-home.jpg`} alt="active bets" />
                <div className="view-bets-textover basic-column-fx justify-around-fx">
                <span className="view-bets-home-title">Active bets</span>
                <span className="view-bets-text">Check your active bets and see if your friends added new bets between them.</span>
                <Link to="/active-bets"><div className="view-bets-link"><span>Go to active bets</span> <FontAwesomeIcon icon={faArrowRight}/></div></Link>
                </div>
                </div>

                <div className="view-bets-home-image-container">
                <img src={`${currentUrl}/public/general/finished-bets-home.jpg`} alt="finished bets" />
                <div className="view-bets-textover basic-column-fx justify-around-fx">
                <span className="view-bets-home-title">Finished bets</span>
                <span className="view-bets-text">Are ya winning, son?  Check bets that have finished. Cheer or despair.</span>
                <Link to="/finished-bets"><div className="view-bets-link"><span>Go to finished bets</span> <FontAwesomeIcon icon={faArrowRight}/></div></Link>
                </div>
                </div>
            </div>
            
        </div>
    );
};

export default ViewBets;