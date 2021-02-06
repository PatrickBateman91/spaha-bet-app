import React, {Component, Fragment} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faEdit, faBalanceScaleRight} from '@fortawesome/free-solid-svg-icons';
import EditModal from './EditModal';
import DifferentStakes from './DifferentStakes';
import SameStakes from './SameStakes';
import JointBet from './JointBet';
import Groups from '../Groups/Groups';
import ReturnButton from '../../MISC/ReturnButton';
import {returnToMain, rightUserCheck} from '../../DumbComponents/SimpleFunctions';
import {getUserData} from '../../Axios/UserRequests';
import {finishBetRequest} from '../../Axios/BetRequests';

class ActiveBets extends Component {
    state={
            bets: [],
            editModalOpen:false,
            editId:"",
            error:false,
            errorMessage:"",
            filteredData:[],
            filterTitle:"",
            finishID:"",
            finishBetModal: false,
            groupsOpen:false,
            modalOpen:false,
            pageLoaded:false,
            success:false,
            successMessage:"",
            trigger:false,
            winner: ""
    }

componentDidMount(){
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
               }
               else{
                   this.setState({pageLoaded:true})
               }
            }).catch(err => {
                this.props.history.push('/sign-in')
            })
        }).catch(err => {
            this.props.history.push('/sign-in')
     })
    
}

chooseBetWinner = (e,name) => {
    e.stopPropagation()
    this.setState({winner:name}, () => {
        this.reRenderBets();
    })
}

closeModals = () => {
    if(this.state.groupsOpen){
        this.setState({groupsOpen:false})
    }
    if(this.state.finishBetModal){
        this.setState({finishBetModal: false, finishID:""}, () => {
            this.reRenderBets();
        })
    }
}

finishedBetToServer = (e,bet,id) =>{
    e.stopPropagation();
    if(this.state.winner !== ""){
        const finishBetPromise = finishBetRequest('finishRequest', this.state.selectedGroup, bet, this.state.winner);
        finishBetPromise.then(res => {
            window.scrollTo(0,0);
            this.setState({
                finishID:"",
                finishBetModal: false,
                success:true,
                successMessage: "Bet has been sent for approval!",
                winner:""
            }, () => {
                const getDataPromise = getUserData('get groups')
                getDataPromise.then(resData => {
                    const selGroup = this.state.selectedGroup;
                    const selName = this.state.selectedGroupName;
                    this.setState({
                        groups:resData.data,
                        selectedGroup:selGroup,
                        selectedGroupName:selName
                    }, () => {
                        this.reRenderBets()
                    })
                }).catch(err => {
                    this.setState({
                        error:true,
                        errorMessage:"Error getting bets!"
                    })
                })
            })
        }).catch(err => {
            this.setState({
                finishID:"",
                finishBetModal: false,
                error:true,
                errorMessage: "Could not finish bet!"
            }, () => {
                setTimeout(() => this.setState({error:false, errorMessage:""}), 1500)
            })
        })
    }

}

getUserProfile = (e, name) => {
   this.props.history.push(`/profile/${name}`)
}

handleEdit = (id) => {
    this.setState({editModalOpen:true, editId:id},() => {
        document.body.style.overflowY = "hidden";
        document.getElementById('modal-container').style.top = `${window.pageYOffset}px`;
    })  
    
}

handleFinish = (e, id) => {
    e.stopPropagation();
    this.setState({
        finishBetModal: true,
        finishID:id
    }, () => {
        this.reRenderBets();
    })
}

handleGroupChange = (e) => {
    e.stopPropagation();
if(e.target.innerHTML.indexOf(">") === -1){
    let newName = e.target.innerHTML;
    const newGroup = this.state.groups.filter(group => group.name === newName);
 this.setState({
     usingFilter:false,
     filterTitle:"",
   groupsOpen:false,
   selectedGroup: newGroup[0]._id,
   selectedGroupName: newGroup[0].name
 }, () => {
     this.updateGroup(newGroup, this.state.groups)
 })
}
}

handleGroupModal = (e) => {
    e.stopPropagation();
    this.setState({
      groupsOpen:true
    })
}

hideModal = (e) =>{
    if(e.target.id === "modal-container" || e.target.innerHTML === "Quit"){
        document.body.style.overflowY = "auto";
        this.setState({
            editModalOpen:false,
            editId:""
        })
    }
}

reRenderBets(){
    let i = 0;
    let trigger;
    let bets;

    let selectedGroup = this.state.groups.filter(group => group._id === this.state.selectedGroup);
    selectedGroup = selectedGroup[0].activeBets;
    
    bets = selectedGroup.map(bet => {
        if (bet.finished === false) {
            trigger = true;
            i++;
            if (bet.jointBet) {
                return <JointBet
                    bet={bet} 
                    chooseBetWinner={this.chooseBetWinner}
                    finishedBetToServer={this.finishedBetToServer}
                    finishID={this.state.finishID}
                    getUserProfile={this.getUserProfile}
                    handleEdit={this.handleEdit}
                    handleFinish={this.handleFinish}
                    idx={i}
                    key={bet._id}
                    rightUserCheck={rightUserCheck}
                    type={'active'}
                    winner={this.state.winner}
                    user={this.state.user}
                />
            }
            else {
                if (bet.differentStakes) {
                    return <DifferentStakes
                        bet={bet} 
                        chooseBetWinner={this.chooseBetWinner}
                        finishedBetToServer={this.finishedBetToServer}
                        finishID={this.state.finishID}
                        getUserProfile={this.getUserProfile}
                        handleFinish={this.handleFinish}
                        handleEdit={this.handleEdit}
                        idx={i}
                        key={bet._id}
                        rightUserCheck={rightUserCheck}
                        type={'active'}
                        winner={this.state.winner}
                        user={this.state.user}
                    />
                }

                else {
                    return <SameStakes
                        bet={bet}
                        chooseBetWinner={this.chooseBetWinner}
                        finishedBetToServer={this.finishedBetToServer}
                        finishID={this.state.finishID}
                        getUserProfile={this.getUserProfile}
                        handleFinish={this.handleFinish}
                        handleEdit={this.handleEdit}
                        idx={i}
                        key={bet._id}
                        rightUserCheck={rightUserCheck}
                        type={'active'}
                        winner={this.state.winner}
                        user={this.state.user} />
                }
            }
        }
        else {
            return false;
        }
    })
    this.setState({
        bets,
        error:false,
        errorMessage:"",
        trigger,
        pageLoaded:true,
        success:false,
        successMessage:"",
    })
}

updateGroup = (selectedGroup, newGroup) => {        
            this.setState({ 
                groups: newGroup,
                selectedGroup:selectedGroup[0]._id,
                selectedGroupName:selectedGroup[0].name,
                user: this.state.user}, () => {
                    this.reRenderBets()
                })
}

render(){
    return (
        <div className="main-container">
        <div className="all-bets-container basic-column-fx wrap-fx align-center-fx" onClick={this.closeModals}>
            {this.state.pageLoaded ?         <Fragment>

                {this.state.user && this.state.bets.length > 0 ?
                
                <div className="upper-bet-container upper-bet-full">
            {this.state.pageLoaded && this.state.user ? 
                 <div id="active-bets-group-container" className="basic-fx justify-between-fx">
                <Groups 
                groups = {this.state.groups}
                groupsOpen={this.state.groupsOpen}
                handleGroupModal={this.handleGroupModal}
                handleGroupChange={this.handleGroupChange}
                selectedGroup={this.state.selectedGroup}
                selectedGroupName={this.state.selectedGroupName}
                />
                </div>
                 : null}
            <div id="whose-bets-title">{this.state.usingFilter ? <span className={"filtered-bets-title"}>{this.state.filterTitle}</span> : null}
                {this.state.trigger ? <ReturnButton 
                classToDisplay="return-button" 
                returnToMain={returnToMain.bind(null, this.props)} 
                text="Main menu" /> : null}
            </div>
            </div>
                 : 
                 <div className="upper-bet-container upper-bet-empty">
                 {this.state.pageLoaded && this.state.user ? 
                      <div id="active-bets-group-container" className="basic-fx justify-between-fx">
                     <Groups 
                     groups = {this.state.groups}
                     groupsOpen={this.state.groupsOpen}
                     handleGroupModal={this.handleGroupModal}
                     handleGroupChange={this.handleGroupChange}
                     selectedGroup={this.state.selectedGroup}
                     selectedGroupName={this.state.selectedGroupName}
                     />
                     </div>
                      : null}
                 </div>
                 }

            <div className="bet-legend basic-column-fx">
                    <div className="legend-section">
                    <div className="legend-item basic-fx justify-around-fx align-center-fx"><span>Edit bet</span><FontAwesomeIcon icon={faEdit} /></div>
                    <div className="legend-item basic-fx justify-around-fx align-center-fx"><span>Finish bet</span><FontAwesomeIcon icon={faBalanceScaleRight} /></div>
                    <div className="legend-item basic-fx justify-around-fx align-center-fx"><span>Bet is time limited</span><FontAwesomeIcon icon={faClock} /></div>
                    </div>

                    <div className="legend-section basic-fx justify-center-fx align-center-fx">
                        <span className="legend-item text-center basic-fx justify-center-fx">You can only edit & finish bets you are apart of</span>
                </div>
                </div>
            {this.state.error ? <div className="error-message give-space">{this.state.errorMessage}</div> :  null}
            {this.state.success ? <div className="success-message give-space">{this.state.successMessage}</div> : null}
            {this.state.trigger ? this.state.bets : <div className="no-active-bets basic-fx align-center-fx">No active bets in this group!</div>}
            <ReturnButton 
            classToDisplay="return-center-button order-last" 
            returnToMain={returnToMain.bind(null, this.props)} 
            text="Main menu" />
             {this.state.editModalOpen ? <EditModal 
    editMode={true}
    editId={this.state.editId}
    hideModal={this.hideModal}
    groups={this.state.groups}
    selectedGroup={this.state.selectedGroup}
    user={this.state.user}
     /> : null}
            </Fragment> : null}
        </div>
        
        </div>
    );
};
}

export default ActiveBets;