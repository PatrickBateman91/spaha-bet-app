import React from 'react';
import { currentUrl } from '../../services/Mode/Mode';

const PaperPin = () => {
    return (
        <div className="home-paper-pin-container">
            <div>
                <img src={`${currentUrl}/public/general/paper-pin.png`} alt="paper-pin" />
            </div>
        </div>
    );
};

export default PaperPin;