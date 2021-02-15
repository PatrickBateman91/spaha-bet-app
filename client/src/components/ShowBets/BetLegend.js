import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faEdit, faBalanceScaleRight } from '@fortawesome/free-solid-svg-icons';

const BetLegend = () => {
    return (
        <Fragment>
            <div className="bet-legend basic-column-fx">
                <div className="legend-section">
                    <div className="legend-item basic-fx justify-around-fx align-center-fx">
                        <span>Edit bet</span>
                        <FontAwesomeIcon icon={faEdit} />
                    </div>

                    <div className="legend-item basic-fx justify-around-fx align-center-fx">
                        <span>Finish bet</span>
                        <FontAwesomeIcon icon={faBalanceScaleRight} />
                    </div>

                    <div className="legend-item basic-fx justify-around-fx align-center-fx">
                        <span>Bet is time limited</span>
                        <FontAwesomeIcon icon={faClock} />
                    </div>

                </div>
                <div className="legend-section basic-fx justify-center-fx align-center-fx">
                    <span className="legend-item text-center basic-fx justify-center-fx">You can only edit & finish bets you are apart of</span>
                </div>
            </div>
        </Fragment>
    );
};

export default BetLegend;