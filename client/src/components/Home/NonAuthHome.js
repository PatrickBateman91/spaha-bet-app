import React, {Fragment} from 'react';
import Slide from 'react-reveal/Slide';
import {currentUrl} from '../MISC/Mode';

const NonAuthHome = (props) => {
    const nonAuthOptions = props.navNonAuth.map(option => {
        return(
        <div id={option.id} key={option.id}>{option.name}</div>
        )
    })
    return (
        <Fragment>
        <div className="non-auth-navigation-container basic-column-fx align-center-fx justify-center-fx">
            <Slide top>
            <div id="non-auth-main-title">One place to keep track of all your bets!</div>
            </Slide>
            <div id="non-auth-smaller-titles">
                <Slide delay={100} left><p>Add bets</p></Slide>
                <Slide delay={250} left><p>Create groups</p></Slide>
                <Slide delay={500} left><p>Track your balance</p></Slide>
                <Slide delay={750} left><p>and much more...</p></Slide>
            </div>
                <div className="non-auth-navigation-holder basic-fx justify-center-fx" onClick={props.handleNavigationClick}>
          <Slide right>{nonAuthOptions}</Slide>
          </div>
          <div id="non-auth-picture-container">
              <Slide bottom>
        <img src={`${currentUrl}/public\\general\\cover-bet.JPG`} alt="cover-bet"/>
        </Slide>
          </div>
          
        </div>
        </Fragment>
    );
};

export default NonAuthHome;