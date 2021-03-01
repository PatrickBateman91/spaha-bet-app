import React from 'react';
import { currentUrl } from '../../services/Mode/Mode';
import './styles.scss';

const HowTo = () => {

    const handlePictureRotation = (type, id) => {
        if(type === "in"){
            document.getElementById(id).classList.remove('spinning-circle-out')
           document.getElementById(id).classList.add('spinning-circle-in')
        }

        else if(type === "out"){
            document.getElementById(id).classList.remove('spinning-circle-in')
            document.getElementById(id).classList.add('spinning-circle-out')
        }
    }

    return (
        <div className="how-to-container basic-column-fx wrap-fx align-center-fx">
            <div className="how-to-title basic-fx justify-center-fx">
                How site works
            </div>

            <div className="how-to-body basic-fx justify-evenly-fx">

                <div className="how-to-item basic-column-fx align-center-fx">
                    <div className="how-to-image-container">
                        <img src={`${currentUrl}/public\\general\\how-to-1.jpg`} alt="add bet" onMouseEnter={handlePictureRotation.bind(null, "in", "howToOne")} onMouseLeave={handlePictureRotation.bind(null, "out", "howToOne")} id="howToOne" />
                        <div className="how-to-number">1</div>
                    </div>
                    <div className="how-to-item-title">Create unique bet</div>
                    <div className="how-to-item-text">Bet on anything your heart desires: sports, politics, life. Bet solo, or in groups.</div>
                </div>

                <div className="how-to-item basic-column-fx align-center-fx">
                    <div className="how-to-image-container">
                        <img src={`${currentUrl}/public\\general\\how-to-2.jpg`} alt="approve bet"  onMouseEnter={handlePictureRotation.bind(null, "in","howToTwo")} onMouseLeave={handlePictureRotation.bind(null, "out", "howToTwo")} id="howToTwo" />
                        <div className="how-to-number">2</div>
                    </div>
                    <div className="how-to-item-title">Wait for others to approve</div>
                    <div className="how-to-item-text">Once all parties involved approve a bet, it will be published.</div>
                </div>

                <div className="how-to-item basic-column-fx align-center-fx">
                    <div className="how-to-image-container">
                        <img src={`${currentUrl}/public\\general\\how-to-3.jpg`} alt="stats" onMouseEnter={handlePictureRotation.bind(null, "in","howToThree")} onMouseLeave={handlePictureRotation.bind(null, "out", "howToThree")} id="howToThree" />
                        <div className="how-to-number">3</div>
                    </div>
                    <div className="how-to-item-title">Finish it when done</div>
                    <div className="how-to-item-text">Choose a winner and track your balance & overall stats.</div>
                </div>

            </div>
        </div>
    );
};

export default HowTo;