import React from 'react';
import AdditionalClauses from '../../components/ShowBets/AdditionalClauses';
import EditedBet from '../../components/ShowBetsMockUp/EditedBet';
import FinishedBet from '../../components/ShowBetsMockUp/FinishedBet';
import NewBet from '../../components/ShowBetsMockUp/NewBet';
import ParticipantsJointBet from '../../components/ShowBets/ParticipantsJointBet';
import TimeLimited from '../../components/ShowBets/TimeLimited';
import JointAnswers from '../../components/ShowBets/JointAnswers';
import './styles.scss';

const JointBetMockUp = (props) => {
    return (
        <div className={`single-bet-container bet-mock-up basic-fx wrap-fx ${props.classToDisplay}`} key={props.bet._id}>
            {props.type === "approve-add" ? <NewBet/> : null}
            {props.type === "approve-edit" ? <EditedBet/> : null}
            {props.type === "approve-finish" ? <FinishedBet/> : null}
            <div id="bet-title">
                {props.bet.subject}
            </div>
            {props.bet.limitedDuration ? <TimeLimited time={props.bet.limitedDurationValue} /> : null}
            <ParticipantsJointBet bet={props.bet} reDirect={props.reDirect} type={props.type} user={props.user} />
            <JointAnswers bet={props.bet} />
            {props.bet.additionalClauses.length > 0 ? props.bet.additionalClauses.map(clause => {
                return (
                    <AdditionalClauses clause={clause} key={clause} />
                )
            }) : null}
        </div>
    );
};

export default JointBetMockUp;