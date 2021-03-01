import React, { Fragment } from 'react';
import HowTo from '../../../components/HowTo/HowTo';
import LoginNav from '../../../parts/Menu/LoginNav';
import Slide from 'react-reveal/Slide';
import { currentUrl } from '../../../services/Mode/Mode';
import './styles.scss';

const NonAuthHome = (props) => {

    return (
        <Fragment>
            <div className="non-auth-navigation-container basic-fx justify-center-fx">
                <div className="non-auth-navigation-body basic-column-fx align-center-fx justify-around-fx">
                    <Slide top>
                        <div id="non-auth-main-title">One place to keep track of all your bets!</div>
                    </Slide>
                    <div id="non-auth-smaller-titles">
                        <Slide delay={100} left><p>Add bets</p></Slide>
                        <Slide delay={250} left><p>Create groups</p></Slide>
                        <Slide delay={500} left><p>Track your balance</p></Slide>
                        <Slide delay={750} left><p>and much more...</p></Slide>
                    </div>
                    <div className="non-auth-navigation-holder basic-fx justify-center-fx">
                        <Slide right>
                            <LoginNav navNonAuth={props.navNonAuth} reDirect={props.reDirect}/>
                        </Slide>
                    </div>
                    <div className="basic-fx fx-wrap justify-around-fx align-start-fx" id="non-auth-bottom-container">
                    <Slide left>
                            <img src={`${currentUrl}/public\\general\\cover-bet.png`} alt="cover-bet" id="cover-bet" />
                        </Slide>
                        <Slide right>
                            <HowTo />
                        </Slide>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default NonAuthHome;