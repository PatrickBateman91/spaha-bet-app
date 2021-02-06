import React, { Component, Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import ReturnButton from '../../MISC/ReturnButton';
import DifferentStakes from './DifferentStakes';
import SameStakes from './SameStakes';
import JointBet from './JointBet';
import Groups from '../Groups/Groups';
import { returnToMain, rightUserCheck } from '../../DumbComponents/SimpleFunctions';
import {getUserData} from '../../Axios/UserRequests';

class FinishedBets extends Component {
 state = {
            filteredData:[],
            filterTitle:"",
            groups:[],
            groupsOpen:false,
            pageLoaded: false,
            selectedGroup: "",
            selectedGroupName:"",
            usingFilter:false,
            user:undefined
    }


    componentDidMount() {
        window.scrollTo(0,0);
            const getUserPromise = getUserData('get user');
            getUserPromise.then(resUser => {
                const getDataPromise = getUserData('get groups')
                getDataPromise.then(resData => {
                   if(resData.data !== "User is not a part of any groups!"){
                    this.setState({
                        groups:resData.data,
                        selectedGroup:resData.data[0]._id,
                        selectedGroupName:resData.data[0].name,
                        user: resUser.data
                    }, () => {
                        this.reRenderBets()
                    })
                   } else{
                       this.setState({pageLoaded:true})
                   }
              

                }).catch(err => {
                    this.props.history.push('/sign-in')
                })
            }).catch(err => {
                this.props.history.push('/sign-in')
            })
    }

    getUserProfile = (e, name) => {
        this.props.history.push(`/profile/${name}`)
     }

    handleGroupChange = (e) => {
        if(e.target.innerHTML.indexOf("<") === -1){
            let newName = e.target.innerHTML;
            const newGroup = this.state.groups.filter(group => group.name === newName);
         this.setState({
           filteredData:[],
           filterTitle:"",
           groupsOpen:false,
           selectedGroup: newGroup[0]._id,
           selectedGroupName: newGroup[0].name,
           usingFilter:false,
         }, () => {
             this.reRenderBets();
         })
        }
    }
    
    handleGroupModal = () => {
        this.setState({
          groupsOpen:true
        })
    }

    updateGroup = (selectedGroup, newGroup) => {
        this.setState({
            groups: newGroup,
            selectedGroup: selectedGroup[0]._id,
            selectedGroupName: selectedGroup[0].name,
            user: this.state.user
        }, () => {
            this.reRenderBets()
        })
    }

    reRenderBets(){
        let i = 0;
        let trigger;
        let bets;
        let selectedGroup = this.state.groups.filter(group => group._id === this.state.selectedGroup);
            selectedGroup = selectedGroup[0].finishedBets;

            bets = selectedGroup.map(bet => {
              
                trigger = true;
                i++;
                if (bet.jointBet) {
                    return <JointBet
                        bet={bet} 
                        getUserProfile={this.getUserProfile}
                        idx={i}
                        key={bet._id}
                        rightUserCheck={rightUserCheck}
                        type={'finished'}
                        winner={bet.winner}
                        user={this.state.user}
                    />
                }
                else {
                    if (bet.differentStakes) {
                        return <DifferentStakes
                            bet={bet} 
                            getUserProfile={this.getUserProfile}
                            idx={i}
                            key={bet._id}
                            rightUserCheck={rightUserCheck}
                            type={'finished'}
                            winner={bet.winner}
                            user={this.state.user}
                        />
                    }
    
                    else {
                        return <SameStakes
                            bet={bet}
                            getUserProfile={this.getUserProfile}
                            idx={i}
                            key={bet._id}
                            rightUserCheck={rightUserCheck}
                            type={'finished'}
                            winner={bet.winner}
                            user={this.state.user} />
                    }
                }
        })
        this.setState({
            bets,
            trigger,
            pageLoaded:true
        })
    }

    render() {
        return (
            <div className="main-container">
            <div className="all-bets-container basic-column-fx wrap-fx align-center-fx">
                {this.state.pageLoaded ? 
                <Fragment>
                    {this.state.user && this.state.bets.length > 0 ?
                                        <div className="upper-bet-container upper-bet-full">
                                        <div id="active-bets-group-container">
                                    <Groups 
                                    groups = {this.state.groups}
                                    groupsOpen={this.state.groupsOpen}
                                    handleGroupModal={this.handleGroupModal}
                                    handleGroupChange={this.handleGroupChange}
                                    selectedGroup={this.state.selectedGroup}
                                    selectedGroupName={this.state.selectedGroupName}
                                    />
                                    </div>
                                    <div id="whose-bets-title" >
                                    {this.state.usingFilter ? <span className={"filtered-bets-title"}>{this.state.filterTitle}</span> : null}
                                        {this.state.trigger ? <ReturnButton classToDisplay="return-button" returnToMain={returnToMain.bind(null, this.props)} text="Main menu" /> : null}
                                    </div>
                                        </div> 
                                        :
                                        <div className="upper-bet-container upper-bet-empty">
                                        <div id="active-bets-group-container">
                                    <Groups 
                                    groups = {this.state.groups}
                                    groupsOpen={this.state.groupsOpen}
                                    handleGroupModal={this.handleGroupModal}
                                    handleGroupChange={this.handleGroupChange}
                                    selectedGroup={this.state.selectedGroup}
                                    selectedGroupName={this.state.selectedGroupName}
                                    />
                                    </div>
                                        </div>
                
                }


                {this.state.trigger ? this.state.bets : <div className="no-finished-bets">No finished bets</div>}
                <div id="legend-finished-bets">
                    <div><span>Winner</span><FontAwesomeIcon icon={faCheck} /></div>
                </div>
                <ReturnButton classToDisplay="return-center-button" returnToMain={returnToMain.bind(null, this.props)} text="Main menu" />

                </Fragment> : null}
            </div>
            </div>
       );
    }
};

export default FinishedBets;