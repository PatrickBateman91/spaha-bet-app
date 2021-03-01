import React, {useState, useEffect} from 'react';
import SingleBet from './SingleBet';

import './styles.scss';

const LatestBets = (props) => {
    const [iteration, setIteration] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    //First iteration
    useEffect(() => {
        if(props.appLoaded && !isRunning){
            setIsRunning(true);
        }
    },[isRunning, props.appLoaded])

    useEffect(() => {
        if(isRunning){
            const timeout = window.setInterval(() => {
                setIteration(iteration => {
                    if(iteration === 9){
                        return iteration = 0;
                    } else {
                        return iteration + 1;
                    }
                });
            },5000);
            return () => window.clearInterval(timeout);
        }
        return undefined
    }, [isRunning])

    return (
        <div className="latest-bets-container basic-column-fx align-center-fx">
            <div className="latest-bets-title">Newest public bets:</div>
            <div className="latest-bets-holder">
            {isRunning ? <SingleBet bet={props.latestBets[iteration]} reDirect={props.reDirect} user={props.user}/> : null}
            </div>
        </div>
    );
};

export default LatestBets;