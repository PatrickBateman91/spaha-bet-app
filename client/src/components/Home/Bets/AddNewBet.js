import React, { Component, Fragment } from 'react';
import {DndProvider} from 'react-dnd'
import Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import {usePreview} from 'react-dnd-preview';
import Groups from '../Groups/Groups';
import ReturnButton from '../../MISC/ReturnButton';
import DraggableName from '../../DnD-Utilities/DraggableName';
import DropInput from '../../DnD-Utilities/DropInput';
import JointDroppable from '../../DnD-Utilities/JointDroppable';
import {editBetRequest, uploadBetRequest} from '../../Axios/BetRequests';
import {getUserData} from '../../Axios/UserRequests';
import {returnToMain, windowWidth} from '../../DumbComponents/SimpleFunctions';

class AddNewBet extends Component {

state={
            people:[],
            participants : [
                {id:"newBetParticipant1", name:"", value:"", singleStake : ""},
                {id:"newBetParticipant2", name:"", value:"", singleStake : ""}
            ],
            additionalClauses:[
                {name :'newBetAdditionalClause1',
                 value:""}],
            draggableElement:{element: "", id: ""},
            error:false,
            errorMessage:"",
            equalBets: false,
            groupsOpen:false,
            jointBet:false,
            jointSelected: [],
            limitedCheck: false,
            moneyClicked: false,
            pageLoaded:false,
            success:false,
            successMessage:"",
            selectedGroup: "",
            selectedGroupName:"",
            options:{enableMouseEvents : true ,enableKeyboardEvents :true}
        }

    addNewAdditionalClause = (e) => {
        e.stopPropagation();
        let copyClausesFromState = [...this.state.additionalClauses];
        copyClausesFromState.push({
            name:`newBetAdditionalClause${this.state.additionalClauses.length + 1}`,
            value:""
        })
        this.setState({additionalClauses:copyClausesFromState});
    }

    addNewParticipant = (e) => {
        e.stopPropagation();
        let copyParticipantsFromState = [...this.state.participants];
        copyParticipantsFromState.push({
            id:`newBetParticipant${copyParticipantsFromState.length+1}`, name:"", value:"", singleStake : ""
        })

        this.setState({participants:copyParticipantsFromState,  equalBets: false})
    }

    addSuggestion = (e,person, id) => {
        e.stopPropagation();
        document.getElementById(id).classList.remove('cannot-select-person');
        document.getElementById(id).classList.add('selected-person');

        let copyParticipantsFromState = [...this.state.participants];
        copyParticipantsFromState.forEach(participant => {
            if(id === participant.id){
                participant.name = person;
            }
        })
               
        this.setState({participants: copyParticipantsFromState});
    }

    alreadyExistsCheck = (person,type) => {
        if(type === "joint"){
            for (let i = 0; i < this.state.jointSelected.length; i++){
                if(this.state.jointSelected[i].name === person){
                    return true;
                }
            }
            return false;
        }
        else{
            for (let i = 0; i < this.state.participants.length; i++){
                if(this.state.participants[i].name === person){
                    return true;
                }
            }
            return false;
        }
     
    }

    componentDidMount(){ 
        if(this.props.editMode){
            const newGroup = this.props.groups.filter(group => group._id === this.props.selectedGroup);
            this.setState({
                groups:this.props.groups,
                pageLoaded:true,
                people:newGroup[0].people,
                user:this.props.user
            }, () => {
                this.getAndSetEditValues();
            })
        }
        else{
                const getUserPromise = getUserData('get user');
                getUserPromise.then(resUser => {       
                    const getDataPromise = getUserData('get groups');
                    getDataPromise.then(resData => {
                      
                        if(resData.data !== "User is not a part of any groups!"){
                            this.setState({
                                groups:resData.data,
                                pageLoaded:true,
                                people: resData.data[0].people,
                                selectedGroup:resData.data[0]._id,
                                selectedGroupName:resData.data[0].name,
                                user: resUser.data
                               })
                        }
                        else{
                            this.setState({
                                groups: [],
                                error:true,
                                errorMessage:"You cannot add bets until you are apart of a group!",
                                pageLoaded:true,
                                people : [resUser.data.nickname],
                                selectedGroup: "",
                                selectedGroupName: "",
                                user : resUser.data,
                            })
                        }
                    }).catch(err => {
                  
                       this.props.history.push('/sign-in')
                    })
                }).catch(err => {
                  
                    this.props.history.push('/sign-in')
                })
            }
        
    }

    createNewBet = (e) => {
        e.preventDefault();
        e.stopPropagation();
            let betAmount;
            let otherStakes;
            let limitedCheckValue = "";
            let newBet = {};
            let people = [];
            let additionalClauses = [];
            let falseValue = false;
            let moneyBet = this.state.moneyClicked;
            let limitedCheck = this.state.limitedCheck;
            let differentStakes = this.state.equalBets;
            let subject = document.getElementById("newBetSubject").value;  
            let rightUserTrigger = false;
            let outsiderTrigger = false;
            let copySuggestions = [...this.state.people];
            let copyJointSelected = [...this.state.jointSelected];
            let copyAdditionalClauses = [...this.state.additionalClauses]
            let copyParticipants = [...this.state.participants];
    
            if(limitedCheck){
                limitedCheckValue = document.getElementById('durationLimitedValue').value; 
            }
          
            //Združena opklada
            if(this.state.jointBet){
                people = [{side: "left", participants: []}, {side: "right", participants: []}]
                let leftValue = document.getElementById('joint-left-side-input1').value;
                let leftBet = document.getElementById('joint-left-side-input2').value;
                let rightValue = document.getElementById('joint-right-side-input2').value;
                let rightBet = document.getElementById('joint-right-side-input1').value;
                if(moneyBet){
                    leftBet = parseFloat(leftBet);
                    rightBet = parseFloat(rightBet);
                }
                people[1].value = leftValue;
                people[1].bet = leftBet;
                people[0].value = rightValue;
                people[0].bet = rightBet;
                copyJointSelected.forEach(participant => {
                    if(participant.name === this.state.user.nickname){
                        rightUserTrigger = true;
                    }
                    if(copySuggestions.indexOf(participant.name) === -1){
                        outsiderTrigger = true;
                    }
                    if(participant.id.indexOf("left") !== -1){
                        people[0].participants.push(participant.name)
                    }
                    else{
                        people[1].participants.push(participant.name)
                    }
                })
                if(!rightUserTrigger){
                    return this.setState({
                        error:true,
                        errorMessage:"You can't add bets that don't include you!"
                    })
                }

                if(people[0].participants.length === 0 || people[1].participants.length === 0){
                    return this.setState({
                        error:true,
                        errorMessage:"One side cannot be empty!"
                    }) 
                }

                if(outsiderTrigger){
                    return this.setState({
                        error:true,
                        errorMessage:"Bets can only be added between registered users!"
                    }) 
                }
    
                if(copyAdditionalClauses.length >= 1 && copyAdditionalClauses[0].value !== "")
                copyAdditionalClauses.forEach(clause => {
                    if(clause.value !== ""){
                        additionalClauses.push(clause.value);
                       }
                })
             //TESTIRANJE DA LI JE DOBRO POPUNJENO
    
            people.forEach(person => {
                if(person.value === "" || person.bet === ""){
                    falseValue = true;
                }
            })
    
             if(subject !== "" && falseValue === false){
    
                if(moneyBet){
                        newBet = {
                            subject,
                            type: "money",
                            jointBet:true,
                            differentStakes,
                            limitedDuration : limitedCheck,
                            limitedDurationValue : limitedCheckValue,
                            finished:false,
                            additionalClauses,
                            participants:people,
                            approvedAddArray:[],
                            approvedEditArray:[],
                            approvedFinishArray:[]
                        }
                }
                else{
                    newBet = {
                        subject,
                        type: "other",
                        jointBet:true,
                        differentStakes,
                        limitedDuration : limitedCheck,
                        limitedDurationValue : limitedCheckValue,
                        finished:false,
                        additionalClauses,
                        participants:people,
                        approvedAddArray:[],
                        approvedEditArray:[],
                        approvedFinishArray:[]
                    }
                }
               if(this.props.editMode){
                newBet._id = this.props.editId;
                const editBetPromise = editBetRequest("editBet", this.props.selectedGroup, newBet);
                editBetPromise.then(res => {
                    this.setState({
                        success:true,
                        successMessage:"Edited bet has been sent for approval!"
                    }, () => {
                        setTimeout(() => window.location.reload(), 1000)
                    })
                }).catch(err => {
                    this.setState({
                        error:true,
                        errorMessage:"Could not edit bet!"
                    })
                })
               }
               else{
                const uploadBetPromise = uploadBetRequest(false, false, this.state.selectedGroup, newBet);
                uploadBetPromise.then(res => {
                    this.setState({
                        success:true,
                        successMessage:"Bet has been sent for approval!"
                    }, () => {
                        setTimeout(() => this.props.history.push({
                            pathname:'/active-bets',
                            state:{user : this.state.user,
                                groups:this.state.groups,
                                selectedGroup: this.state.selectedGroup}
                        }), 1000)
                    })
                }).catch(err => {
                       this.setState({
                           error:true,
                           errorMessage:"Could not upload bet to server!"
                       })
                })
               }
            }
    
            else{
                this.setState({error: true, errorMessage: "Bet has not been filled up properly!"})
            }
            }
    
            //Obična opklada
            else{
    
                if(moneyBet && !differentStakes){
                    betAmount = parseFloat(document.getElementById('newBetAmount').value);
                 }
                else if(!moneyBet && !differentStakes){
                    otherStakes = document.getElementById('newBetOther').value;
                }
    
                //Između koga je opklada -> People varijabla

                copyParticipants.forEach((participant,index) => {
                    if(participant.name === this.state.user.nickname){
                        rightUserTrigger = true;
                    }
                    if(copySuggestions.indexOf(participant.name) === -1){
                        outsiderTrigger = true;
                    }
                    if(!this.state.equalBets){
                        if(!participant.value || !participant.name){
                            falseValue = true;
                        }
                        else{
                            people.push({
                                name : participant.name,
                                value: participant.value
                            })
                        }
                    }
               
                    else{
                        if(!participant.value || !participant.name || !participant.singleStake){
                            falseValue = true;
                        }
                        else{
                            otherStakes = null;
                            if(index === 0){
                                let switchStake;
                                if(moneyBet || !isNaN(copyParticipants[1].singleStake)){
                                    switchStake = parseFloat(copyParticipants[1].singleStake);
                                }
                                else{
                                    switchStake = copyParticipants[1].singleStake;
                                }
                         
                                people.push({
                                    name : participant.name,
                                    value: participant.value,
                                    singleStake : switchStake
                                })
                            }

                            else{
                                let switchStake;
                            if(moneyBet || !isNaN(copyParticipants[0].singleStake)){
                                switchStake = parseFloat(copyParticipants[0].singleStake);
                            }

                            else{
                                switchStake = copyParticipants[0].singleStake;
                            }
                        
                            people.push({
                                name : participant.name,
                                value: participant.value,
                                singleStake : switchStake
                            })
                            }
                        }

                    }
                })
               
                if(!rightUserTrigger){
                    return this.setState({
                        error:true,
                        errorMessage:"You can't add bets that don't include you!"
                    })
                }
            
                if(outsiderTrigger){
                    return this.setState({
                        error:true,
                        errorMessage:"Bets can only be added between registered users!"
                    })  
                }
   
                //Testiranje dodatnih klauzula => additionalClauses varijabla
                if(copyAdditionalClauses.length >= 1 && copyAdditionalClauses[0].value !== "")
                copyAdditionalClauses.forEach(clause => {
                    if(clause.value !== ""){
                        additionalClauses.push(clause.value);
                       }
                })
    
                //Testiranje da li postoji u šta se klade
                if(!differentStakes){
                    if(moneyBet){
                        if(!betAmount){
                            falseValue = true;
                        }
                    }
                    else{
                        if(!otherStakes){
                            falseValue = true;
                        }
                    }
                }

                if(subject !== "" && !falseValue){
    
                    if(moneyBet){
                            newBet = {
                                subject,
                                type: "money",
                                differentStakes,
                                amount: differentStakes ? null : betAmount,
                                limitedDuration : limitedCheck,
                                limitedDurationValue : limitedCheckValue,
                                finished:false,
                                additionalClauses,
                                participants:people,
                                approvedAddArray:[],
                                approvedEditArray:[],
                                approvedFinishArray:[]
                            }
                    }
                    else{
                        newBet = {
                            subject,
                            type: "other",
                            differentStakes,
                            stake:otherStakes,
                            limitedDuration : limitedCheck,
                            limitedDurationValue : limitedCheckValue,
                            finished:false,
                            additionalClauses,
                            participants:people,
                            approvedAddArray:[],
                            approvedEditArray:[],
                            approvedFinishArray:[]
                        }
          
                    }
                  if(this.props.editMode){
                    newBet._id = this.props.editId;
                    const editBetPromise = editBetRequest("editBet", this.props.selectedGroup, newBet);
                    editBetPromise.then(res => {
                        this.setState({
                            success:true,
                            successMessage:"Edited bet has been sent for approval!"
                        }, () => {
                            setTimeout(() => window.location.reload(), 1000)
                        })
                    }).catch(err => {
                        this.setState({
                            error:true,
                            errorMessage:"Could not edit bet!"
                        })
                    })
                  }
                  else{
                    const uploadBetPromise = uploadBetRequest(false, false, this.state.selectedGroup, newBet);
                    uploadBetPromise.then(res => {
                        this.setState({
                            success:true,
                            successMessage:"Bet has been sent for approval!"
                        }, () => {
                            setTimeout(() => this.props.history.push({
                                pathname:'/active-bets',
                                state:{
                                    groups:this.state.groups,
                                    selectedGroup: this.state.selectedGroup,
                                    user : this.state.user,}
                            }), 1000)
                        })
                    }).catch(err => {
                           this.setState({
                               error:true,
                               errorMessage:"Could not upload bet to server!"
                           })
                    })
                  }
                }
        
                else{
                    this.setState({error: true, errorMessage: "Bet has not been filled properly!"})
                }
            } 
    }

    closeModals = () => {
        if(this.state.groupsOpen){
            this.setState({groupsOpen:false})
        }
    }

    drop = (item, monitor, type, id) => {
        if(type === "regularBet"){
           let copyParticipantsFromState = [...this.state.participants];
           copyParticipantsFromState.forEach(participant => {
               if(participant.id === id){
                   participant.name = item.name;
               }
           })
            this.setState({participants:copyParticipantsFromState}, () =>{
                this.promjeniJebenuklasu(id);
            });
        }
        
        else if(type === "jointBet"){
           
 
        if(id === "left"){
         let newJointSelected = [...this.state.jointSelected];
         newJointSelected.push({name: item.name, id:id});
         this.setState({jointSelected:newJointSelected})
        }
 
        else{
         let newJointSelected = [...this.state.jointSelected];
         newJointSelected.push({name: item.name, id:id});
         this.setState({jointSelected:newJointSelected})
        } 
          
       
        }
      
    }

    getAndSetEditValues = () => {
        const theGroup = this.props.groups.filter(group => group._id === this.props.selectedGroup);
        const theOne = theGroup[0].activeBets.filter(bet => bet._id === this.props.editId);

        let filteredBet = theOne[0];

        if(filteredBet.jointBet){
            let newJointSelected = [];
            filteredBet.participants.forEach(item => {
                item.participants.forEach(participant => {
                    newJointSelected.push({id: item.side, name:participant})
                })
            })

            let newAdditionalClauses = [];
            if(filteredBet.additionalClauses.length > 0){
                filteredBet.additionalClauses.forEach((clause, index) => {
                    newAdditionalClauses.push({
                        name:`newBetAdditionalClause${index+1}`,
                        value: clause
                    });
                })
            }

            this.setState({
                jointBet:true,
                jointSelected:newJointSelected,
                limitedCheck: filteredBet.limitedDuration,
                moneyClicked : filteredBet.type === "money" ? true:false,
                additionalClauses:newAdditionalClauses
            }, () => {
                if(filteredBet.type === "money"){
                    document.getElementById('moneyBetCheck').checked = true;
                }

                if(filteredBet.limitedDuration){
                    document.getElementById('durationLimitedCheck').checked = true;
                    document.getElementById('durationLimitedValue').value = filteredBet.limitedDurationValue;
                } 
            document.getElementById('newBetSubject').value = filteredBet.subject;
            document.getElementById('joint-left-side-input1').value = filteredBet.participants[0].value;
            document.getElementById('joint-left-side-input2').value = filteredBet.participants[0].bet;
            document.getElementById('joint-right-side-input1').value= filteredBet.participants[1].bet;
            document.getElementById('joint-right-side-input2').value = filteredBet.participants[1].value;
            })
        }
        else{
            let newParticipants = filteredBet.participants.map((participant, index) => {
                participant.id = `newBetParticipant${index+1}`;
                return participant;
            })
    
            let newAdditionalClauses = [];
            if(filteredBet.additionalClauses.length > 0){
                filteredBet.additionalClauses.forEach((clause, index) => {
                    newAdditionalClauses.push({
                        name:`newBetAdditionalClause${index+1}`,
                        value: clause
                    });
                })
            }
    
            this.setState({
                additionalClauses:newAdditionalClauses,
                participants:newParticipants,
                limitedCheck: filteredBet.limitedDuration,
                moneyClicked : filteredBet.type === "money" ? true:false,
                equalBets: filteredBet.differentStakes
            }, () => {
                document.getElementById('newBetSubject').value = filteredBet.subject;
                if(filteredBet.type === "money" && filteredBet.differentStakes === false){
                    document.getElementById('moneyBetCheck').checked = true;
                    document.getElementById('newBetAmount').value = filteredBet.amount;
                }
                else if(filteredBet.type === "other" && filteredBet.differentStakes === false){
                    document.getElementById('newBetOther').value = filteredBet.stake;
                }
                if(filteredBet.differentStakes ){
                    document.getElementById('moneyBetEquality').checked = true;
                    
                }
        
                if(filteredBet.limitedDuration){
                    document.getElementById('durationLimitedCheck').checked = true;
                    document.getElementById('durationLimitedValue').value = filteredBet.limitedDurationValue;
                }    
            }) 
        }
    }

    handleGroupModal = () => {
        this.setState({
          groupsOpen:true
        })
    }

    handleGroupChange = (e) => {
        if(e.target.innerHTML.indexOf('>') === -1){
            let newName = e.target.innerHTML;
            const newGroup = this.state.groups.filter(group => group.name === newName);
            const fieldsToRevert = Array.from(document.getElementsByClassName('participant-input-name'));
            fieldsToRevert.forEach(field => field.classList.remove('selected-person'))
         this.setState({
           people:newGroup[0].people,
           groupsOpen:false,
           jointSelected: [],   
           participants : [
            {id:"newBetParticipant1", name:"", value:"", singleStake : ""},
            {id:"newBetParticipant2", name:"", value:"", singleStake : ""}],
           selectedGroup: newGroup[0]._id,
           selectedGroupName: newGroup[0].name
         })
        }
    }

    handleLimitedCheck = () => {
        let newCheck = !this.state.limitedCheck;
        this.setState({limitedCheck: newCheck});
    }

    hideError = (e) => {
        e.stopPropagation();
        this.setState({error:false, errorMessage:""})
    }

    jointBetFunction = (e) => {
        e.stopPropagation();
        let newValue = !this.state.jointBet;
        if(newValue){
            document.getElementById('jointBet').innerHTML = "Obična opklada";
        }
        else{
            document.getElementById('jointBet').innerHTML = "Združena opklada";
        }
        this.setState({
            participants : [
                {id:"newBetParticipant1", name:"", value:"", singleStake : ""},
                {id:"newBetParticipant2", name:"", value:"", singleStake : ""}
            ],
            jointSelected: [],
            additionalClauses:[
                {name :'newBetAdditionalClause1',
                 value:""}],
            limitedCheck: false,
            moneyClicked: false,
            equalBets: false,
            jointBet : newValue,
            draggableElement:{element: "", id: ""},
            error:false,
            errorMessage:""})
    }

    moneyClickFunction = () => {
        let clickSwitch = !this.state.moneyClicked;
        this.setState({moneyClicked : clickSwitch});
    }

    moneyEqualBets = (e,number) => {
        e.stopPropagation();
        let clickEqualBets = !this.state.equalBets;
        if(this.state.jointBet){

        }

        else{
            if(number < 2){
                number = 2;
            }
           
            if(clickEqualBets === false){
                for (let i = 0; i < number; i++){
                    document.getElementById(`newBetParticipantStake${i+1}`).value = "";
                }
            }
        }

        this.setState({equalBets : clickEqualBets});
    }

    nameType = (e, id) => {
        e.stopPropagation();
            let typingParameter = e.target.value;
            let trigger = 0;
            let idx;
            let nameToCheck;
    
            if(e.key !== "Backspace"){
                let filteredPeople = this.state.people.filter(person => {
                    return person.toLowerCase().startsWith(typingParameter.toLowerCase());
                })
    
                if(filteredPeople.length === 1){
                    let copyParticipantsFromState = [...this.state.participants];
                    copyParticipantsFromState.forEach((participant, index) => {
                        if(participant.name === filteredPeople[0]){
                            trigger++;
                            nameToCheck = participant.name;
                        }
                        if(participant.id === id){
                            idx = index;
                        }       
                    })
    
                    if(trigger > 1){
                        if(typingParameter === nameToCheck){
                            document.getElementById(id).classList.remove('selected-person');
                            document.getElementById(id).classList.add('cannot-select-person');
                        }
                    }
    
                    else{
                        document.getElementById(id).classList.add('selected-person');
                        document.getElementById(id).classList.remove('cannot-select-person');
                        copyParticipantsFromState[idx].name = filteredPeople[0];
                        this.setState({participants : copyParticipantsFromState});
                    }
                }
                
                else if(filteredPeople.length === 0){
                    document.getElementById(id).classList.remove('selected-person');
                    document.getElementById(id).classList.remove('cannot-select-person');
                }
            }
        
            else if(e.key === "Backspace" && e.target.value !== ""){
                let participantExists = false;
                for(let i = 0; i < this.state.people.length; i++){
                    if(this.state.people[i].toLowerCase() === typingParameter.toLowerCase()){
                        participantExists = true;
                        break;
                    }
                }
    
                if(participantExists){
                    let copyParticipantsFromState = [...this.state.participants];
                    copyParticipantsFromState.forEach((participant) => {
                        if(participant.name === typingParameter){
                            trigger++;
                        }
                    })
    
                    if(trigger >= 2){
                        document.getElementById(id).classList.remove('selected-person');
                        document.getElementById(id).classList.add('cannot-select-person');          
                    }
                    else{     
                        document.getElementById(id).classList.remove('cannot-select-person');
                        document.getElementById(id).classList.add('selected-person');
                    }
                }
    
                else{
                    document.getElementById(id).classList.remove('selected-person');
                    document.getElementById(id).classList.remove('cannot-select-person');
                }
            }
            
            if(typingParameter === ""){
                document.getElementById(id).classList.remove('selected-person');
                document.getElementById(id).classList.remove('cannot-select-person');
            }
    }
    
    promjeniJebenuklasu(id){
        const hep = () => document.querySelector(`#${id}`).classList.add('selected-person');

        setTimeout(hep, 10);
    }

    removeJointParticipant = (e,name) => {
       let copyJointSelected = [...this.state.jointSelected];
       let newJointSelected =  copyJointSelected.filter(item => {
            return item.name !== name;
       })

       this.setState({jointSelected:newJointSelected})
    }

    removeAdditionalClause = (e) => {
        e.stopPropagation();
        let copyClausesFromState = [...this.state.additionalClauses];
        for (let i = 0; i < copyClausesFromState.length; i++){
            if(copyClausesFromState[i].name === e.target.nextSibling.id){
                copyClausesFromState.splice(i,1);
                break;
            }
        }
        copyClausesFromState.forEach((clause,index) => {
            clause.name = `newBetAdditionalClause${index+1}`
        })
       this.setState({additionalClauses:copyClausesFromState});
    }

    removeParticipant = (e) => {
        e.stopPropagation();
        let copyParticipantsFromState = [...this.state.participants];
        copyParticipantsFromState.forEach((participant, index) => {
            if(participant.id === e.target.parentNode.firstChild.id){
                copyParticipantsFromState.splice(index,1);
            }
        })
        copyParticipantsFromState.forEach((participant, index) => {
            participant.id = `newBetParticipant${index + 1}`
        })

        this.setState({participants:copyParticipantsFromState});
    }

    settingAdditionalClauseValue = (e) => {
        e.stopPropagation();
        let copyClausesFromState = [...this.state.additionalClauses];
        copyClausesFromState.forEach(clause => {
            if(clause.name === e.target.id){
                clause.value = e.target.value;
            }
        })
        this.setState({additionalClauses:copyClausesFromState})
    }

    settingParticipants = (e, type) => {
    let typingParameter = e.target.value;
    let copyParticipantsFromState = [...this.state.participants];

            copyParticipantsFromState.forEach(participant => {
                if(participant.id === e.target.id){
                    if(type === 'name'){
                        participant.name = typingParameter;
                    }
                }

                else if(participant.id === e.target.parentNode.firstChild.id){
                    if(type === 'value'){
                        participant.value = e.target.value;
                    }
                    else if(type === 'stake'){
                        participant.singleStake = e.target.value;
                    }
                }    
            })

    this.setState({participants : copyParticipantsFromState})
    }

    render() {
    let participantsToRender = this.state.participants.map((item, index) => {
    return (
        <Fragment key={item.id}>
        <div className="full-line-center basic-fx justify-between-fx">
            <DropInput 
            classNameToDisplay="participant-input-name"
             itemOnKeyUp={this.nameType} 
             itemClicked={`newBetParticipant${index + 1}`}
             itemOnDrop={this.drop} 
             itemOnChange={this.settingParticipants}
             id={`newBetParticipant${index + 1}`}
             itemName={item.name}
             placeholder="nickname"/>

            <input type="text" 
            name={`newBetParticipantValue${index + 1}`} 
            id={`newBetParticipantValue${index + 1}`} 
            value={item.value}
            onChange={e => this.settingParticipants(e, 'value')}
            placeholder="says..."/>
            

            <input type={this.state.moneyClicked ? "number" : "text"}
            name={`newBetParticipantStake${index + 1}`} 
            id={`newBetParticipantStake${index + 1}`} 
            onChange={e => this.settingParticipants(e, 'stake')}
            value={this.state.equalBets ? item.singleStake : ""}
            placeholder={this.state.equalBets ? this.state.moneyClicked ? "bet / how much money?"  : "bet / in what?" : null}
            disabled={!this.state.equalBets} />
            {this.state.participants.length > 2 ? <span className="removeAdditionalClauseOrParticipant" onClick={this.removeParticipant}>x</span> : null}
        </div>
        {this.state.people.map(person => {
            let check = this.alreadyExistsCheck(person, "regular");
            if (check === false) {
                return (
                    <DraggableName
                    classNameToDisplay="not-chosen"
                    id={`${item.id}${person}`}
                    key={person}
                    person={person}
                    itemOnClick={this.addSuggestion}
                    itemClicked={`newBetParticipant${index + 1}`}
                    />
                )
            }
                else {
                    return null
                };
          
    })}
        </Fragment>
    )
    })

    let jointBetToRender = (
        <Fragment>
            <div id="joint-bet-container" className="basic-fx wrap-fx">

            <JointDroppable
                        idToDisplay="left-joint-side"
                        itemOnDrop={this.drop}
                        jointSelected={this.state.jointSelected}
                        searchIndex = "left"
                        divId={"left-joint-"}
                        removeJointParticipant={this.removeJointParticipant}
                        />

                <JointDroppable 
                idToDisplay="right-joint-side"
                itemOnDrop={this.drop}
                jointSelected={this.state.jointSelected}
                searchIndex = "right"
                divId={"right-joint-"}
                removeJointParticipant={this.removeJointParticipant}
                />
            </div>

            <div id="joint-bet-inputs-container" className="basic-fx">
            <div className="input-joint-side">
        <input id="joint-left-side-input1" type="text" placeholder={"left side says what"}/>
        <input id="joint-left-side-input2" type="text" placeholder="amount"/>
            </div>
            <div className="input-joint-side">
            <input id="joint-right-side-input1" type="text" placeholder="amount"/>
            <input id="joint-right-side-input2" type="text" placeholder="right side says what"/>
            </div>
        </div>


            <div id="joint-bet-names-suggestions" className="basic-fx wrap-fx">
            {this.state.people.map(person => {
            let check = this.alreadyExistsCheck(person, "joint");
            if (check === false) {
                return (
                    <DraggableName
                    classNameToDisplay="not-chosen"
                    id={`jointBet${person}`}
                    key={person}
                    person={person}
                    itemOnClick={e => false}
                    />
                )
            }
                else {
                    return null
                };
          
    })}
    </div>

            </Fragment>
        );

        
     const MyPreview = () => {
        const {display, itemType, item, style} = usePreview();
        if (!display) {
          return null;
        }
        return <div className="onDrag" style={style}>{item.name}</div>;
      };

        return (
     
            <DndProvider backend={windowWidth(480) ? Backend : TouchBackend}>
                {windowWidth(480) ? null : <MyPreview />}
                <div className={`${this.props.editMode ? "" : "main-container main-background"} basic-column-fx justify-center-fx align-center-fx`}>
                {this.state.pageLoaded ?      <Fragment>
            <div id="add-new-bet-container" className="basic-fx justify-center-fx " onClick={this.closeModals}>
                <form id="addNewBet" onSubmit={this.createNewBet} onChange={this.hideError}>
    
                    <div className="full-line-space basic-fx justify-between-fx">
                        <label htmlFor="newBetSubject">Bet subject</label>
                        <input type="text" id="newBetSubject" name="newBetSubject" />
                    </div>
                    {this.state.pageLoaded && !this.props.editMode ? <div id="add-bet-group-container" className="basic-fx justify-center-fx">
                        <Groups 
                    groups={this.state.groups}
                    groupsOpen={this.state.groupsOpen}
                    handleGroupModal={this.handleGroupModal}
                    handleGroupChange={this.handleGroupChange}
                    selectedGroup={this.state.selectedGroup} 
                    selectedGroupName={this.state.selectedGroupName}
                    /></div> : null}   
                    <div className="bet-between">Bet is between:</div>
    
                {!this.state.jointBet ? participantsToRender : jointBetToRender}

                    <div className="full-line-space basic-fx justify-between-fx">
                        {!this.state.jointBet ? <button type="button" className="add-clause-participant-button" onClick={this.addNewParticipant}>Add participant</button> : null}
                        <button type="button" id="jointBet" className="add-clause-participant-button" onClick={this.jointBetFunction}>Group bet</button>
                    </div>   
                    <div className="full-line-space basic-fx justify-between-fx">
                        <label htmlFor="moneyBetCheck">Money bet?</label>
                        <input type="checkbox" id="moneyBetCheck" name="moneyBetCheck" onChange={this.moneyClickFunction} />
                    </div>
                    {!this.state.jointBet && this.state.participants.length < 3 ?    <div className="full-line-space basic-fx justify-between-fx">
                        <label htmlFor="moneyBetEquality">Different stakes?</label>
                        <input type="checkbox" id="moneyBetEquality" name="moneyBetEquality" onChange={e => this.moneyEqualBets(e,this.state.participants.length)} />
                    </div>  : null}
                                
                    <div className="full-line-space basic-fx justify-between-fx">
                        <label htmlFor="durationLimitedCheck">Time limited?</label>
                        <input type="checkbox" id="durationLimitedCheck" name="durationLimitedCheck" onChange={this.handleLimitedCheck}/>
                    </div>

                    {this.state.limitedCheck ? <div className="full-line-space basic-fx justify-between-fx">
                        <label htmlFor="durationLimitedValue">Until when?</label>
                        <input type="text" id="durationLimitedValue" name="durationLimitedValue" />
                    </div> : null}
                {!this.state.jointBet ? !this.state.equalBets ?
                    <Fragment>
                        {this.state.moneyClicked ?
                    <div className="full-line-space basic-fx justify-between-fx">
                        <label htmlFor="newBetAmount">Amount</label>
                        <input type="text" id="newBetAmount" name="newBetAmount" />
                    </div> : null}
                    {!this.state.moneyClicked ?
                    <div className="full-line-space basic-fx justify-between-fx">
                        <label htmlFor="newBetOther">Winner gets</label>
                        <input type="text" id="newBetOther" name="newBetOther" />
                    </div> : null}</Fragment> : null : null}
                    

    {this.state.additionalClauses.map((item, index) => {
        return (
            <div className="full-line-space basic-fx justify-between-fx" key={item.name}>
            <label htmlFor={`newBetAdditionalClause${index+1}`}>{`Additional clause ${index + 1}`}</label>
            <span className="removeAdditionalClauseOrParticipant" onClick={this.removeAdditionalClause}>x</span>
            <input type="text" id={`newBetAdditionalClause${index+1}`} 
            onChange={this.settingAdditionalClauseValue} 
            value={this.state.additionalClauses[index].value}
            name={`newBetAdditionalClause${index+1}`} />
        </div>
        )
    })}
                 
                    
                    <button type="button" className="add-clause-participant-button" onClick={this.addNewAdditionalClause}>Add clause</button>
{this.state.error ? <div className="error-message">{this.state.errorMessage}</div> :  null}
{this.state.success ? <div className="success-message">{this.state.successMessage}</div> : null}

                    <div id="add-bet-button-container" className="basic-fx justify-around-fx align-center-fx">
<button type="submit" form="addNewBet">{this.props.editMode ? "Edit bet" : "Add bet"}</button>
{this.props.editMode ? <button type="button" onClick={this.props.hideModal}>Quit</button> : null }
                    </div>
                </form>
            </div>
           {this.props.editMode ? null : <ReturnButton returnToMain = {returnToMain.bind(null, this.props)} 
           classToDisplay="return-add-button" text={"Main menu"} />} 
        
            </Fragment> : null }
                </div>
       
            </DndProvider>
        );
    }
}

export default AddNewBet;