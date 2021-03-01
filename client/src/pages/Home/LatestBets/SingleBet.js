import React from 'react';
import SameStakesMockUp from '../../../parts/Bets/SameStakesMockUp';
import DifferentStakesMockUp from '../../../parts/Bets/DifferentStakesMockUp';
import JointBetMockUp from '../../../parts/Bets/JointBetMockUp';

const SingleBet = (props) => {
    if(props.bet.jointBet){
        return (<JointBetMockUp bet={props.bet} classToDisplay="newest-bets" reDirect={props.reDirect} user={props.user} type="latest-bets"/>)
    } 
    
    else if(props.bet.differentStakes){
        return( <DifferentStakesMockUp classToDisplay="newest-bets" bet={props.bet} reDirect={props.reDirect} user={props.user} type="latest-bets"/>)
    }

    else{
        return(<SameStakesMockUp bet={props.bet} classToDisplay="newest-bets" reDirect={props.reDirect} user={props.user} type="latest-bets"/>)
    }
};

export default SingleBet;