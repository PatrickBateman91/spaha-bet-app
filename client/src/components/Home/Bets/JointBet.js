import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {compareArrays} from '../../DumbComponents/SimpleFunctions';
import {faClock, faInfoCircle, faEdit, faHistory, faBalanceScaleRight, faCheck, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import { currentUrl } from '../../MISC/Mode';

const JointBet = (props) => {

    return (
        <div className="single-bet-container basic-fx wrap-fx" key={props.bet._id}>
                        <div className="home-paper-pin-container">
                <div>
                    <img src={`${currentUrl}/public/general/paper-pin.png`}  alt="paper-pin"/>
                </div>
            </div>
{props.type === "finished" || props.type === "approve-finish" ? props.bet.winner === "No winner" ? <div className="no-winner-check">No winner? <FontAwesomeIcon icon={faTimesCircle} /></div> : null : null}
{props.type === "finished" ? null : props.bet._id === props.finishID ? 
<div id="finish-bet" className={props.bet._id === props.finishID ? "basic-column-fx align-center-fx" : "display-none"}>
                <div id="finish-bet-clicked" className="basic-column-fx wrap-fx align-center-fx justify-evenly-fx" onClick={e => e.stopPropagation()}>
                <div>Who won the bet?</div>
                <div className="basic-fx wrap-fx">
               <div className={`joint-winners basic-column-fx align-between-fx justify-center-fx ${compareArrays(props.bet.participants[0].participants, props.winner) ? "winner-marked" : ""}`}>
           {props.bet.participants[0].participants.map(item => {
              return ( 
              <span 
              className={props.user.nickname === item ? "participant1" : "participant8"} 
              key={item} 
              onClick={e => props.chooseBetWinner(e,props.bet.participants[0].participants)}>
                  {item}
                  </span>)
           })}
                </div>
                <div className={`joint-winners basic-column-fx align-between-fx justify-center-fx ${compareArrays(props.bet.participants[1].participants,props.winner) ? "winner-marked" : ""}`}>  
            {props.bet.participants[1].participants.map(item => {
              return ( 
              <span 
              className={`${props.user.nickname === item ? "participant1" : "participant8"}`} 
              key={item} 
              onClick={e => props.chooseBetWinner(e,props.bet.participants[1].participants)}>
                  {item}
                  </span>)
           })}
           </div>
           </div>
         
           <div className={`no-winner ${props.winner === "nobody" ? "winner-marked" : ""}`} onClick={e => props.chooseBetWinner(e,"nobody")}>Nobody won?</div>
<button onClick={e => props.finishedBetToServer(e, props.bet, props.bet._id)} type="button">Confirm</button>
</div>
            </div> : null }
         
             {props.type !== "active" ? null : props.user ? 
            <div id="finish-icon-container"><FontAwesomeIcon icon={faBalanceScaleRight} onClick={e => props.handleFinish(e, props.bet._id)}/> </div>
            : null}
        <div className="try-out-border-top-left"></div>
        <div id="bet-title">
        {`${props.type !== "active" ? props.bet.subject : props.idx + ". " + props.bet.subject}`}
            {props.type === "active" && props.rightUserCheck(props.user.nickname, 'jointBet', props.bet) ?  <div className="edit-icon"><FontAwesomeIcon onClick={e => props.handleEdit(props.bet._id)} icon={faEdit}/></div> : null}
           
        </div>
        {props.type === "finished" ? null : props.bet.limitedDuration ? 
        <div className="clock-holder">
        <FontAwesomeIcon icon={faClock}/>
        <div className="show-hide-duration">{props.bet.limitedDurationValue}</div>
        </div> : null}


        <div className="joint-bet-holder basic-fx justify-between-fx">
        <div className={`joint-display-side basic-column-fx`}>
        {props.type === "finished" || props.type === "approve-finish" ? compareArrays(props.bet.winner, props.bet.participants[0].participants) ?
                    <div className="joint-finished-winner-left"><FontAwesomeIcon icon={faCheck}/></div>
                 :null : null}

            {props.bet.participants[0].participants.map((name, index) => {
                    return (
                      <div className="basic-fx justify-between-fx align-center-fx" key={name}>
                        <span className={`joint-participant-name ${props.user.nickname === name ? "participant1" : "participant8"}`}
                         onClick={e => props.getUserProfile(e, name)}>{name}
                         </span>
                       
                {props.bet.type === "money" ? 
                <span className="joint-bets-bet basic-fx justify-center-fx align-center-fx bet-left">
                    {`${(props.bet.participants[0].bet / props.bet.participants[0].participants.length).toFixed(2)} $`}
                        </span>
                        : index === 0 ?     
                        <div className="joint-bets-bet basic-fx justify-center-fx align-center-fx bet-left">
                        { `${props.bet.participants[0].bet}`}
                         {props.bet.type === "money" ? `${(props.bet.participants[0].bet / props.bet.participants[0].participants.length).toFixed(2)} $` : null}
                     </div> : null}    
              </div>

             
                    )
                })}
                </div>
                <div className={`joint-display-side basic-column-fx`}>
                    {props.type === "finished" || props.type === "approve-finish" ? compareArrays(props.bet.winner, props.bet.participants[1].participants) ?
                    <div className="joint-finished-winner-right"><FontAwesomeIcon icon={faCheck} /></div>
                 :null : null}
            {props.bet.participants[1].participants.map((name, index) => {
                    return (
                        <div className="basic-fx justify-between-fx align-center-fx" key={name}>

        
                      {props.bet.type === "money" ? 
                <span className="joint-bets-bet bet-right">
                    {`${(props.bet.participants[1].bet / props.bet.participants[1].participants.length).toFixed(2)} $`}
                        </span>
                        : index === 0 ?     
                        <span className="joint-bets-bet bet-right">
                        { `${props.bet.participants[1].bet}`}
                         {props.bet.type === "money" ? `${(props.bet.participants[1].bet / props.bet.participants[1].participants.length).toFixed()} $` : null}
                     </span> : <span className="bet-right"></span>}   
                

                     <span className={`joint-participant-name ${props.user.nickname === name ? "participant1" : "participant8"}`} onClick={e => props.getUserProfile(e, name)}>{name}</span>
                    
                        </div>
                    )
                })}
                  </div>
    </div>

    <div className="joint-bet-answers-container basic-fx justify-around-fx">
            <div className="participant-value basic-fx justify-center-fx">
                <span>{props.bet.participants[0].value}</span>
            </div>
            <div className="participant-value basic-fx justify-center-fx">
            <span>{props.bet.participants[1].value}</span>
            </div>
        </div>




         {props.bet.additionalClauses.length > 0 ? props.bet.additionalClauses.map(clause => {
             return (
                 <div key={clause} className="additional-clauses-container">
                <FontAwesomeIcon icon={faInfoCircle}/>
                 <span>{clause}</span>
                 </div>
             )
         }) : null}
        {props.bet.changes ? <div id="edit-changes" className="basic-fx justify-end-fx">
         <FontAwesomeIcon icon={faHistory}/>
         <div className="edit-change-item">
         <span id="change-title">Changes:</span>
             {props.bet.changes.map(item => {
                 return (
                     <div className="single-change-item" key={item.time}>
                         <span>{item.name}</span>
                         <span>{item.time}</span>
                     </div>
                 )
                 })}
             </div>
         </div> : null}

          <div className="try-out-border-bottom-right"></div>
    </div>
    );
};

export default JointBet;