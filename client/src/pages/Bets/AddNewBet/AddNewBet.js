import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { changeGroup } from '../../../components/Groups/GroupsDropdown/ChangeGroupFunction';
import { DndProvider } from 'react-dnd'
import { editBetRequest, uploadBetRequest } from '../../../services/Axios/BetRequests';
import { calculateBalance, changeSingleGroup, getShortStats, returnToMain, windowWidth } from '../../../services/HelperFunctions/HelperFunctions';
import { usePreview } from 'react-dnd-preview';
import { withRouter } from 'react-router-dom';
import AdditionalClauses from '../../../components/AddBet/AdditionalClauses';
import AddCheckbox from '../../../components/AddBet/Checkbox';
import Backend from 'react-dnd-html5-backend';
import ConfirmButton from '../../../components/Buttons/ConfirmButton';
import DangerButton from '../../../components/Buttons/DangerButton';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import GroupsDropdown from '../../../components/Groups/GroupsDropdown/GroupsDropdown';
import InputField from '../../../components/AddBet/InputField';
import JointParticipants from '../../../components/AddBet/JointParticipants';
import Loader from '../../../components/Loaders/Loader';
import RegularParticipants from '../../../components/AddBet/RegularParticipants';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import SuccessModal from '../../../components/Modals/SuccessModal';
import TouchBackend from 'react-dnd-touch-backend';
import './styles.scss';

class AddNewBet extends Component {

    state = {
        people: [],
        participants: [
            { id: "newBetParticipant1", name: "", value: "", singleStake: "" },
            { id: "newBetParticipant2", name: "", value: "", singleStake: "" }
        ],
        additionalClauses: [
            {
                name: 'newBetAdditionalClause1',
                value: ""
            }],
        draggableElement: { element: "", id: "" },
        error: false,
        errorMessage: "",
        equalBets: false,
        groupsOpen: false,
        jointBet: false,
        jointSelected: [],
        limitedCheck: false,
        moneyClicked: false,
        pageLoaded: false,
        success: false,
        successMessage: "",
        selectedGroup: "",
        selectedGroupName: "",
        options: { enableMouseEvents: true, enableKeyboardEvents: true }
    }

    addNewAdditionalClause = (e) => {
        e.stopPropagation();
        let copyClausesFromState = [...this.state.additionalClauses];
        copyClausesFromState.push({
            name: `newBetAdditionalClause${this.state.additionalClauses.length + 1}`,
            value: ""
        })
        this.setState({ additionalClauses: copyClausesFromState });
    }

    addNewParticipant = (e) => {
        e.stopPropagation();
        let copyParticipantsFromState = [...this.state.participants];
        copyParticipantsFromState.push({
            id: `newBetParticipant${copyParticipantsFromState.length + 1}`, name: "", value: "", singleStake: ""
        })

        this.setState({ participants: copyParticipantsFromState, equalBets: false })
    }

    addSuggestion = (e, person, id) => {
        e.stopPropagation();
        document.getElementById(id).classList.remove('cannot-select-person');
        document.getElementById(id).classList.add('selected-person');

        let copyParticipantsFromState = [...this.state.participants];
        copyParticipantsFromState.forEach(participant => {
            if (id === participant.id) {
                participant.name = person;
            }
        })

        this.setState({ participants: copyParticipantsFromState });
    }

    alreadyExistsCheck = (person, type) => {
        if (type === "joint") {
            for (let i = 0; i < this.state.jointSelected.length; i++) {
                if (this.state.jointSelected[i].name === person) {
                    return true;
                }
            }
            return false;
        }
        else {
            for (let i = 0; i < this.state.participants.length; i++) {
                if (this.state.participants[i].name === person) {
                    return true;
                }
            }
            return false;
        }

    }

    componentDidMount() {
        window.scrollTo(0, 0);
        document.getElementById('root').style.height = "100%";
        if (this.props.appLoaded) {
            if (this.props.editMode) {
                const newGroup = this.props.groups.filter(group => group._id.toString() === this.props.selectedGroup.toString());
                this.setState({
                    pageLoaded: true,
                    people: newGroup[0].people,
                }, () => {
                    this.getAndSetEditValues();
                })
            }
            else {
                if (this.props.user === 'guest') {
                    this.props.history.push('/sign-in')
                } else if (this.props.groups.length === 0) {
                    this.setState({
                        error: true,
                        errorMessage: "You cannot add bets until you are apart of a group!",
                        pageLoaded: true,
                        people: [this.props.user.nickname],
                    })
                } else {
                    const newGroup = this.props.groups.filter(group => group._id === this.props.selectedGroup);
                    this.setState({
                        people: newGroup[0].people,
                        pageLoaded: true
                    })
                }
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.appLoaded && this.props.appLoaded) {
            if (this.props.user === "guest") {
                this.props.history.push('/');
            } else {
                if (this.props.editMode) {
                    const newGroup = this.props.groups.filter(group => group._id === this.props.selectedGroup);
                    this.setState({
                        pageLoaded: true,
                        people: newGroup[0].people,
                    }, () => {
                        this.getAndSetEditValues();
                    })
                }
                else {
                    if (this.props.groups.length === 0) {
                        this.setState({
                            error: true,
                            errorMessage: "You cannot add bets until you are apart of a group!",
                            pageLoaded: true,
                            people: [this.props.user.nickname],
                        })
                    } else {
                        const newGroup = this.props.groups.filter(group => group._id === this.props.selectedGroup);
                        this.setState({
                            people: newGroup[0].people,
                            pageLoaded: true
                        })
                    }
                }
            }
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

        if (limitedCheck) {
            limitedCheckValue = document.getElementById('durationLimitedValue').value;
        }

        //Združena opklada
        if (this.state.jointBet) {
            people = [{ side: "left", participants: [] }, { side: "right", participants: [] }]
            let leftValue = document.getElementById('joint-left-side-input1').value;
            let leftBet = document.getElementById('joint-left-side-input2').value;
            let rightValue = document.getElementById('joint-right-side-input2').value;
            let rightBet = document.getElementById('joint-right-side-input1').value;
            if (moneyBet) {
                leftBet = parseFloat(leftBet);
                rightBet = parseFloat(rightBet);
            }
            people[1].value = leftValue;
            people[1].bet = leftBet;
            people[0].value = rightValue;
            people[0].bet = rightBet;
            copyJointSelected.forEach(participant => {
                if (participant.name === this.props.user.nickname) {
                    rightUserTrigger = true;
                }
                if (copySuggestions.indexOf(participant.name) === -1) {
                    outsiderTrigger = true;
                }
                if (participant.id.indexOf("left") !== -1) {
                    people[0].participants.push(participant.name)
                }
                else {
                    people[1].participants.push(participant.name)
                }
            })

            if (!rightUserTrigger) {
                return this.setState({
                    error: true,
                    errorMessage: "You can't add bets that don't include you!"
                })
            }

            if (people[0].participants.length === 0 || people[1].participants.length === 0) {
                return this.setState({
                    error: true,
                    errorMessage: "One side cannot be empty!"
                })
            }

            if (outsiderTrigger) {
                return this.setState({
                    error: true,
                    errorMessage: "Bets can only be added between registered users!"
                })
            }

            if (copyAdditionalClauses.length >= 1 && copyAdditionalClauses[0].value !== "")
                copyAdditionalClauses.forEach(clause => {
                    if (clause.value !== "") {
                        additionalClauses.push(clause.value);
                    }
                })

            //TESTIRANJE DA LI JE DOBRO POPUNJENO
            people.forEach(person => {
                if (person.value === "" || person.bet === "") {
                    falseValue = true;
                }
            })

            if (subject !== "" && falseValue === false) {
                if (moneyBet) {
                    newBet = {
                        subject,
                        type: "money",
                        jointBet: true,
                        differentStakes,
                        limitedDuration: limitedCheck,
                        limitedDurationValue: limitedCheckValue,
                        finished: false,
                        additionalClauses,
                        participants: people,
                        approvedAddArray: [],
                        approvedEditArray: [],
                        approvedFinishArray: []
                    }
                }
                else {
                    newBet = {
                        subject,
                        type: "other",
                        jointBet: true,
                        differentStakes,
                        limitedDuration: limitedCheck,
                        limitedDurationValue: limitedCheckValue,
                        finished: false,
                        additionalClauses,
                        participants: people,
                        approvedAddArray: [],
                        approvedEditArray: [],
                        approvedFinishArray: []
                    }
                }
                if (this.props.editMode) {
                    newBet._id = this.props.editId;
                    const editBetPromise = editBetRequest("editBet", this.props.selectedGroup, newBet);
                    editBetPromise.then(groupResponse => {
                        document.body.style.pointerEvents = 'none';
                        document.body.style.cursor = 'wait';
                        const changedGroups = changeSingleGroup(this.props.groups, this.props.selectedGroup, groupResponse.data.payload);
                        let statsObject = getShortStats(changedGroups, this.props.user.nickname);
                        statsObject.balance = calculateBalance(changedGroups, this.props.user.nickname);
                        this.props.setShortStats(statsObject);
                        this.props.setGroups(changedGroups);
                        this.setState({
                            success: true,
                            successMessage: "Edited bet has been sent for approval!"
                        });
                        setTimeout(() => {
                            document.body.style.pointerEvents = 'auto';
                            document.body.style.cursor = "auto";
                            this.props.history.push('/')
                        }, 1000)
                    }).catch(err => {
                        this.setState({
                            error: true,
                            errorMessage: err.response.data.message
                        })
                    })
                }
                else {
                    document.body.style.pointerEvents = 'none';
                    document.body.style.cursor = "wait";
                    const uploadBetPromise = uploadBetRequest(false, false, this.props.selectedGroup, newBet);
                    uploadBetPromise.then(res => {
                        this.setState({
                            success: true,
                            successMessage: res.data.message
                        }, () => {
                            document.getElementById('success-modal-container').style.top = `${window.pageYOffset}px`;
                            setTimeout(() => {
                                document.body.style.pointerEvents = 'auto';
                                document.body.style.cursor = "auto";
                                this.props.history.push('/')
                            }, 1000)
                        })
                    }).catch(err => {
                        this.setState({
                            error: true,
                            errorMessage: err.response.data.message
                        })
                    })
                }
            }

            else {
                this.setState({ error: true, errorMessage: "Bet has not been filled up properly!" })
            }
        }

        //Obična opklada
        else {

            if (moneyBet && !differentStakes) {
                betAmount = parseFloat(document.getElementById('newBetAmount').value);
            }
            else if (!moneyBet && !differentStakes) {
                otherStakes = document.getElementById('newBetOther').value;
            }

            //Između koga je opklada -> People varijabla
            copyParticipants.forEach((participant, index) => {
                if (participant.name === this.props.user.nickname) {
                    rightUserTrigger = true;
                }
                if (copySuggestions.indexOf(participant.name) === -1) {
                    outsiderTrigger = true;
                }
                if (!this.state.equalBets) {
                    if (!participant.value || !participant.name) {
                        falseValue = true;
                    }
                    else {
                        people.push({
                            name: participant.name,
                            value: participant.value
                        })
                    }
                }

                else {
                    if (!participant.value || !participant.name || !participant.singleStake) {
                        falseValue = true;
                    }
                    else {
                        otherStakes = null;
                        if (index === 0) {
                            let switchStake;
                            if (moneyBet || !isNaN(copyParticipants[1].singleStake)) {
                                switchStake = parseFloat(copyParticipants[1].singleStake);
                            }
                            else {
                                switchStake = copyParticipants[1].singleStake;
                            }

                            people.push({
                                name: participant.name,
                                value: participant.value,
                                singleStake: switchStake
                            })
                        }

                        else {
                            let switchStake;
                            if (moneyBet || !isNaN(copyParticipants[0].singleStake)) {
                                switchStake = parseFloat(copyParticipants[0].singleStake);
                            }

                            else {
                                switchStake = copyParticipants[0].singleStake;
                            }

                            people.push({
                                name: participant.name,
                                value: participant.value,
                                singleStake: switchStake
                            })
                        }
                    }

                }
            })

            if (!rightUserTrigger) {
                return this.setState({
                    error: true,
                    errorMessage: "You can't add bets that don't include you!"
                })
            }

            if (outsiderTrigger) {
                return this.setState({
                    error: true,
                    errorMessage: "Bets can only be added between registered users!"
                })
            }

            //Testiranje dodatnih klauzula => additionalClauses varijabla
            if (copyAdditionalClauses.length >= 1 && copyAdditionalClauses[0].value !== "")
                copyAdditionalClauses.forEach(clause => {
                    if (clause.value !== "") {
                        additionalClauses.push(clause.value);
                    }
                })

            //Testiranje da li postoji u šta se klade
            if (!differentStakes) {
                if (moneyBet) {
                    if (!betAmount) {
                        falseValue = true;
                    }
                }
                else {
                    if (!otherStakes) {
                        falseValue = true;
                    }
                }
            }

            if (subject !== "" && !falseValue) {

                if (moneyBet) {
                    newBet = {
                        subject,
                        type: "money",
                        differentStakes,
                        amount: differentStakes ? null : betAmount,
                        limitedDuration: limitedCheck,
                        limitedDurationValue: limitedCheckValue,
                        finished: false,
                        additionalClauses,
                        participants: people,
                        approvedAddArray: [],
                        approvedEditArray: [],
                        approvedFinishArray: []
                    }
                }
                else {
                    newBet = {
                        subject,
                        type: "other",
                        differentStakes,
                        stake: otherStakes,
                        limitedDuration: limitedCheck,
                        limitedDurationValue: limitedCheckValue,
                        finished: false,
                        additionalClauses,
                        participants: people,
                        approvedAddArray: [],
                        approvedEditArray: [],
                        approvedFinishArray: []
                    }

                }
                if (this.props.editMode) {
                    newBet._id = this.props.editId;
                    const editBetPromise = editBetRequest("editBet", this.props.selectedGroup, newBet);
                    editBetPromise.then(groupResponse => {
                        document.body.style.pointerEvents = 'none';
                        document.body.style.cursor = 'wait';
                        const changedGroups = changeSingleGroup(this.props.groups, this.props.selectedGroup, groupResponse.data.payload);
                        let statsObject = getShortStats(changedGroups, this.props.user.nickname);
                        statsObject.balance = calculateBalance(changedGroups, this.props.user.nickname);
                        this.props.setShortStats(statsObject);
                        this.props.setGroups(changedGroups);
                        this.setState({
                            success: true,
                            successMessage: "Edited bet has been sent for approval!"
                        });
                        setTimeout(() => {
                            document.body.style.pointerEvents = 'auto';
                            document.body.style.cursor = 'auto';
                            this.props.history.push('/');
                        }, 1000)
                    }).catch(err => {
                        this.setState({
                            error: true,
                            errorMessage: err.response.data.message
                        })
                    })
                }
                else {
                    document.body.style.pointerEvents = 'none';
                    document.body.style.cursor = "wait";
                    const uploadBetPromise = uploadBetRequest(false, false, this.props.selectedGroup, newBet);
                    uploadBetPromise.then(res => {
                        this.setState({
                            success: true,
                            successMessage: res.data.message
                        }, () => {
                            setTimeout(() => {
                                document.body.style.pointerEvents = 'auto';
                                document.body.style.cursor = "auto";
                                this.props.history.push('/')
                            }, 1000)
                        });
                    }).catch(err => {
                        this.setState({
                            error: true,
                            errorMessage: err.response.data.message
                        })
                    })
                }
            }

            else {
                this.setState({ error: true, errorMessage: "Bet has not been filled properly!" })
            }
        }
    }

    closeModals = () => {
        if (this.state.groupsOpen) {
            this.setState({ groupsOpen: false })
        }
    }

    drop = (item, monitor, type, id) => {
        if (type === "regularBet") {
            let copyParticipantsFromState = [...this.state.participants];
            copyParticipantsFromState.forEach(participant => {
                if (participant.id === id) {
                    participant.name = item.name;
                }
            })
            this.setState({ participants: copyParticipantsFromState }, () => {
                this.promjeniJebenuklasu(id);
            });
        }

        else if (type === "jointBet") {


            if (id === "left") {
                let newJointSelected = [...this.state.jointSelected];
                newJointSelected.push({ name: item.name, id: id });
                this.setState({ jointSelected: newJointSelected })
            }

            else {
                let newJointSelected = [...this.state.jointSelected];
                newJointSelected.push({ name: item.name, id: id });
                this.setState({ jointSelected: newJointSelected })
            }


        }

    }

    getAndSetEditValues = () => {
        const theGroup = this.props.groups.filter(group => group._id.toString() === this.props.selectedGroup.toString());
        const theOne = theGroup[0].activeBets.filter(bet => bet._id.toString() === this.props.editId.toString());

        let filteredBet = JSON.parse(JSON.stringify(theOne[0]));

        if (filteredBet.jointBet) {
            let newJointSelected = [];
            filteredBet.participants.forEach(item => {
                item.participants.forEach(participant => {
                    newJointSelected.push({ id: item.side, name: participant })
                })
            })

            let newAdditionalClauses = [];
            if (filteredBet.additionalClauses.length > 0) {
                filteredBet.additionalClauses.forEach((clause, index) => {
                    newAdditionalClauses.push({
                        name: `newBetAdditionalClause${index + 1}`,
                        value: clause
                    });
                })
            }

            this.setState({
                jointBet: true,
                jointSelected: newJointSelected,
                limitedCheck: filteredBet.limitedDuration,
                moneyClicked: filteredBet.type === "money" ? true : false,
                additionalClauses: newAdditionalClauses
            }, () => {
                if (filteredBet.type === "money") {
                    document.getElementById('moneyBetCheck').checked = true;
                }

                if (filteredBet.limitedDuration) {
                    document.getElementById('durationLimitedCheck').checked = true;
                    document.getElementById('durationLimitedValue').value = filteredBet.limitedDurationValue;
                }
                document.getElementById('newBetSubject').value = filteredBet.subject;
                document.getElementById('joint-left-side-input1').value = filteredBet.participants[0].value;
                document.getElementById('joint-left-side-input2').value = filteredBet.participants[0].bet;
                document.getElementById('joint-right-side-input1').value = filteredBet.participants[1].bet;
                document.getElementById('joint-right-side-input2').value = filteredBet.participants[1].value;
            })
        }
        else {
            let newParticipants = filteredBet.participants.map((participant, index) => {
                participant.id = `newBetParticipant${index + 1}`;
                return participant;
            })

            let newAdditionalClauses = [];
            if (filteredBet.additionalClauses.length > 0) {
                filteredBet.additionalClauses.forEach((clause, index) => {
                    newAdditionalClauses.push({
                        name: `newBetAdditionalClause${index + 1}`,
                        value: clause
                    });
                })
            }

            this.setState({
                additionalClauses: newAdditionalClauses,
                participants: newParticipants,
                limitedCheck: filteredBet.limitedDuration,
                moneyClicked: filteredBet.type === "money" ? true : false,
                equalBets: filteredBet.differentStakes
            }, () => {
                document.getElementById('newBetSubject').value = filteredBet.subject;
                if (filteredBet.type === "money" && filteredBet.differentStakes === false) {
                    document.getElementById('moneyBetCheck').checked = true;
                    document.getElementById('newBetAmount').value = filteredBet.amount;
                }
                else if (filteredBet.type === "other" && filteredBet.differentStakes === false) {
                    document.getElementById('newBetOther').value = filteredBet.stake;
                }
                if (filteredBet.differentStakes) {
                    document.getElementById('moneyBetEquality').checked = true;

                }

                if (filteredBet.limitedDuration) {
                    document.getElementById('durationLimitedCheck').checked = true;
                    document.getElementById('durationLimitedValue').value = filteredBet.limitedDurationValue;
                }
            })
        }
    }

    handleGroupModal = (e) => {
        e.stopPropagation();
        this.setState({
            groupsOpen: true
        })
    }

    handleGroupChange = (ID, e) => {
        console.log(ID, e)
        e.stopPropagation();
        const newGroup = changeGroup(this.props.groups, ID, this.props.setGroup, this.props.setGroupName);
        const fieldsToRevert = Array.from(document.getElementsByClassName('participant-input-name'));
        fieldsToRevert.forEach(field => field.classList.remove('selected-person'))
        this.setState({
            people: newGroup,
            groupsOpen: false,
            jointSelected: [],
            participants: [
                { id: "newBetParticipant1", name: "", value: "", singleStake: "" },
                { id: "newBetParticipant2", name: "", value: "", singleStake: "" }]
        })
    }

    handleLimitedCheck = () => {
        let newCheck = !this.state.limitedCheck;
        this.setState({ limitedCheck: newCheck });
    }

    hideError = (e) => {
        if (e) {
            e.stopPropagation();
        }
        this.setState({ error: false, errorMessage: "" })
    }

    jointBetFunction = (e) => {
        e.stopPropagation();
        let newValue = !this.state.jointBet;
        if (newValue) {
            document.getElementById('jointBet').innerHTML = "Regular bet";
        }
        else {
            document.getElementById('jointBet').innerHTML = "Group bet";
        }
        this.setState({
            participants: [
                { id: "newBetParticipant1", name: "", value: "", singleStake: "" },
                { id: "newBetParticipant2", name: "", value: "", singleStake: "" }
            ],
            jointSelected: [],
            additionalClauses: [
                {
                    name: 'newBetAdditionalClause1',
                    value: ""
                }],
            limitedCheck: false,
            moneyClicked: false,
            equalBets: false,
            jointBet: newValue,
            draggableElement: { element: "", id: "" },
            error: false,
            errorMessage: ""
        })
    }

    moneyClickFunction = (e) => {
        e.stopPropagation();
        let clickSwitch = !this.state.moneyClicked;
        this.setState({ moneyClicked: clickSwitch });
    }

    moneyEqualBets = (number, e) => {
        e.stopPropagation();
        let clickEqualBets = !this.state.equalBets;
        if (this.state.jointBet) {

        }

        else {
            if (number < 2) {
                number = 2;
            }

            if (clickEqualBets === false) {
                for (let i = 0; i < number; i++) {
                    document.getElementById(`newBetParticipantStake${i + 1}`).value = "";
                }
            }
        }

        this.setState({ equalBets: clickEqualBets });
    }

    nameType = (e, id) => {
        e.stopPropagation();
        let typingParameter = e.target.value;
        let trigger = 0;
        let idx;
        let nameToCheck;

        if (e.key !== "Backspace") {
            let filteredPeople = this.state.people.filter(person => {
                return person.toLowerCase().startsWith(typingParameter.toLowerCase());
            })

            if (filteredPeople.length === 1) {
                let copyParticipantsFromState = [...this.state.participants];
                copyParticipantsFromState.forEach((participant, index) => {
                    if (participant.name === filteredPeople[0]) {
                        trigger++;
                        nameToCheck = participant.name;
                    }
                    if (participant.id === id) {
                        idx = index;
                    }
                })

                if (trigger > 1) {
                    if (typingParameter === nameToCheck) {
                        document.getElementById(id).classList.remove('selected-person');
                        document.getElementById(id).classList.add('cannot-select-person');
                    }
                }

                else {
                    document.getElementById(id).classList.add('selected-person');
                    document.getElementById(id).classList.remove('cannot-select-person');
                    copyParticipantsFromState[idx].name = filteredPeople[0];
                    this.setState({ participants: copyParticipantsFromState });
                }
            }

            else if (filteredPeople.length === 0) {
                document.getElementById(id).classList.remove('selected-person');
                document.getElementById(id).classList.remove('cannot-select-person');
            }
        }

        else if (e.key === "Backspace" && e.target.value !== "") {
            let participantExists = false;
            for (let i = 0; i < this.state.people.length; i++) {
                if (this.state.people[i].toLowerCase() === typingParameter.toLowerCase()) {
                    participantExists = true;
                    break;
                }
            }

            if (participantExists) {
                let copyParticipantsFromState = [...this.state.participants];
                copyParticipantsFromState.forEach((participant) => {
                    if (participant.name === typingParameter) {
                        trigger++;
                    }
                })

                if (trigger >= 2) {
                    document.getElementById(id).classList.remove('selected-person');
                    document.getElementById(id).classList.add('cannot-select-person');
                }
                else {
                    document.getElementById(id).classList.remove('cannot-select-person');
                    document.getElementById(id).classList.add('selected-person');
                }
            }

            else {
                document.getElementById(id).classList.remove('selected-person');
                document.getElementById(id).classList.remove('cannot-select-person');
            }
        }

        if (typingParameter === "") {
            document.getElementById(id).classList.remove('selected-person');
            document.getElementById(id).classList.remove('cannot-select-person');
        }
    }

    promjeniJebenuklasu(id) {
        const hep = () => document.querySelector(`#${id}`).classList.add('selected-person');

        setTimeout(hep, 10);
    }

    removeJointParticipant = (e, name) => {
        let copyJointSelected = [...this.state.jointSelected];
        let newJointSelected = copyJointSelected.filter(item => {
            return item.name !== name;
        })

        this.setState({ jointSelected: newJointSelected })
    }

    removeAdditionalClause = (e) => {
        e.stopPropagation();
        let copyClausesFromState = [...this.state.additionalClauses];
        for (let i = 0; i < copyClausesFromState.length; i++) {
            if (copyClausesFromState[i].name === e.target.nextSibling.id) {
                copyClausesFromState.splice(i, 1);
                break;
            }
        }
        copyClausesFromState.forEach((clause, index) => {
            clause.name = `newBetAdditionalClause${index + 1}`
        })
        this.setState({ additionalClauses: copyClausesFromState });
    }

    removeParticipant = (e) => {
        e.stopPropagation();
        let copyParticipantsFromState = [...this.state.participants];
        copyParticipantsFromState.forEach((participant, index) => {
            if (participant.id === e.target.parentNode.firstChild.id) {
                copyParticipantsFromState.splice(index, 1);
            }
        })
        copyParticipantsFromState.forEach((participant, index) => {
            participant.id = `newBetParticipant${index + 1}`
        })

        this.setState({ participants: copyParticipantsFromState });
    }

    settingAdditionalClauseValue = (e) => {
        e.stopPropagation();
        let copyClausesFromState = [...this.state.additionalClauses];
        copyClausesFromState.forEach(clause => {
            if (clause.name === e.target.id) {
                clause.value = e.target.value;
            }
        })
        this.setState({ additionalClauses: copyClausesFromState })
    }

    settingParticipants = (e, type) => {
        let typingParameter = e.target.value;
        let copyParticipantsFromState = [...this.state.participants];

        copyParticipantsFromState.forEach(participant => {
            if (participant.id === e.target.id) {
                if (type === 'name') {
                    participant.name = typingParameter;
                }
            }

            else if (participant.id === e.target.parentNode.firstChild.id) {
                if (type === 'value') {
                    participant.value = e.target.value;
                }
                else if (type === 'stake') {
                    participant.singleStake = e.target.value;
                }
            }
        })

        this.setState({ participants: copyParticipantsFromState })
    }

    render() {
        let participantsToRender = this.state.participants.map((item, index) => {
            return (
                <RegularParticipants
                    addSuggestion={this.addSuggestion}
                    alreadyExistsCheck={this.alreadyExistsCheck}
                    drop={this.drop}
                    equalBets={this.state.equalBets}
                    index={index}
                    item={item}
                    nameType={this.nameType}
                    moneyClicked={this.state.moneyClicked}
                    key={item.id}
                    participants={this.state.participants}
                    removeParticipant={this.removeParticipant}
                    settingParticipants={this.settingParticipants}
                    people={this.state.people}
                />
            )
        })

        let jointBetToRender = (
            <JointParticipants
                alreadyExistsCheck={this.alreadyExistsCheck}
                drop={this.drop}
                jointSelected={this.state.jointSelected}
                people={this.state.people}
                removeJointParticipant={this.removeJointParticipant}
            />
        );

        const MyPreview = () => {
            const { display, itemType, item, style } = usePreview();
            if (!display) {
                return null;
            }
            if (itemType === "card") {
                return <div className="onDrag" style={style}>{item.name}</div>;
            }
        };

        if (this.state.error) {
            setTimeout(() => this.hideError(), 1500);
        }

        return (
            <DndProvider backend={windowWidth(480) ? Backend : TouchBackend}>
                {windowWidth(480) ? null : <MyPreview />}
                <div className={`${this.props.editMode ? "" : windowWidth(480) ? "main-container main-background" : "main-container mobile-alternative-background"} basic-column-fx justify-center-fx align-center-fx`}>
                    {this.state.pageLoaded ? <Fragment>
                        <div id="add-new-bet-container" className="basic-fx justify-center-fx " onClick={this.closeModals}>
                            <form id="addNewBet" onSubmit={this.createNewBet} onChange={this.hideError}>
                                {this.state.pageLoaded && !this.props.editMode ? <div className="basic-fx justify-center-fx relative add-bet-group-container">
                                    <GroupsDropdown
                                        groups={this.props.groups}
                                        groupsOpen={this.state.groupsOpen}
                                        handleGroupModal={this.handleGroupModal}
                                        handleGroupChange={this.handleGroupChange}
                                        selectedGroup={this.props.selectedGroup}
                                        selectedGroupName={this.props.selectedGroupName}
                                    /></div> : null}

                                <div className="full-line-space basic-fx justify-between-fx">
                                    <label htmlFor="newBetSubject">Bet subject</label>
                                    <input type="text" id="newBetSubject" name="newBetSubject" />
                                </div>

                                <div className="bet-between">Participants:</div>
                                {!this.state.jointBet ? participantsToRender : jointBetToRender}
                                <div className={`full-line-space basic-fx ${this.state.jointBet ? "justify-center-fx" : " justify-between-fx"}`}>
                                    {!this.state.jointBet ? <button type="button" className="add-clause-participant-button" onClick={this.addNewParticipant}>Add participant</button> : null}
                                    <button type="button" id="jointBet" className="add-clause-participant-button" onClick={this.jointBetFunction}>Group bet</button>
                                </div>
                                <AddCheckbox id="moneyBetCheck" function={this.moneyClickFunction} text="Money bet?" />
                                {!this.state.jointBet && this.state.participants.length < 3 ?
                                    <AddCheckbox id="moneyBetEquality" function={this.moneyEqualBets.bind(this, this.state.participants.length)} text="Different bets?" /> : null}
                                <AddCheckbox id="durationLimitedCheck" function={this.handleLimitedCheck} text="Time limited?" />
                                {this.state.limitedCheck ? <InputField id="durationLimitedValue" text="Until when?" /> : null}
                                {!this.state.jointBet ? !this.state.equalBets ?
                                    <Fragment>
                                        {this.state.moneyClicked ? <InputField id="newBetAmount" text="Amount" /> : null}
                                        {!this.state.moneyClicked ? <InputField id="newBetOther" text="Winner gets" /> : null}</Fragment> : null : null}
                                {this.state.additionalClauses.map((item, index) => {
                                    return (
                                        <AdditionalClauses
                                            index={index}
                                            key={item.name}
                                            removeAdditionalClause={this.removeAdditionalClause}
                                            settingAdditionalClauseValue={this.settingAdditionalClauseValue}
                                            value={this.state.additionalClauses[index].value}
                                        />
                                    )
                                })}
                                <button type="button" className="add-clause-participant-button" onClick={this.addNewAdditionalClause}>Add clause</button>
                                {this.state.error ? <ErrorMessage text={this.state.errorMessage} classToDisplay="message-space" /> : null}
                                {this.props.editMode ?
                                    <div className="basic-fx justify-around-fx align-center-fx">
                                        <ConfirmButton classToDisplay="confirm-button-space" text="Edit bet" type="submit" />
                                        <DangerButton disabled={false} handleDangerButton={this.props.hideModal} text="Quit" type="button" />
                                    </div>
                                    : <ConfirmButton classToDisplay="basic-fx justify-center-fx confirm-button-space" text="Add bet" type="submit" />}
                            </form>
                        </div>
                        {this.props.editMode ? null : <ReturnButton
                            returnToMain={returnToMain.bind(null, this.props)}
                            classToDisplay="return-button-space return-button-medium" text="Main menu" />}
                    </Fragment> : <Loader loading={this.state.pageLoaded} />}
                    {this.state.success ? <SuccessModal message={this.state.successMessage} /> : null}
                </div>
            </DndProvider>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        appLoaded: state.appStates.appLoaded,
        selectedGroup: state.appStates.selectedGroup,
        selectedGroupName: state.appStates.selectedGroupName,
        groups: state.groups,
        user: state.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setGroup: (id) => {
            dispatch({ type: "appStates/setGroup", payload: id })
        },

        setGroups: (groups) => {
            dispatch({ type: "groups/setGroups", payload: groups })
        },

        setGroupName: (name) => {
            dispatch({ type: "appStates/setGroupName", payload: name })
        },

        setShortStats: (stats) => {
            dispatch({ type: "appStates/setShortStats", payload: stats })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AddNewBet));