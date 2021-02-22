import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { manageGroupsRequest } from '../../../services/Axios/GroupRequests';
import { calculateBalance, changeSingleGroup, getShortStats, joinArrays, isMobile, removeGroup, returnToMain } from '../../../services/HelperFunctions/HelperFunctions';
import GroupLine from '../../../components/Groups/ManageGroups/GroupLine';
import Loader from '../../../components/Loaders/Loader';
import ManageGroupsModal from '../../../parts/Groups/ManageGroups/ManageGroupsModal';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import SuccessMessage from '../../../components/Messages/SuccessMessage';
import './styles.scss';

class ManageGroups extends Component {
    state = {
        error: false,
        errorMessage: "",
        groupName: "",
        pageLoaded: false,
        modalOpen: false,
        outsiderTrigger: false,
        people: [],
        peopleToRemove: [],
        selectedPeople: [],
        selectedOutsiders: [],
        selectedGroup: "",
        success: false,
        successMessage: "",
        suggestions: [],
        suggestionsTrigger: false,
        suggestionsFromDatabase: [],
        user: [],
        warningCheck: false,
        whichModal: ""

    }

    addRemoveOutsider = (suggestion) => {
        const nameToCheck = suggestion;
        const arrayToCheck = this.state.selectedOutsiders.indexOf(nameToCheck);
        if (arrayToCheck === -1) {
            const copyOutsiders = [...this.state.selectedOutsiders];
            const filteredDatabase = this.state.suggestionsFromDatabase.filter(person => person !== suggestion);
            copyOutsiders.push(nameToCheck);
            this.setState({
                selectedOutsiders: copyOutsiders,
                outsiderTrigger: true,
                suggestionsFromDatabase: filteredDatabase
            })
        }
        else {
            const newOutsiders = this.state.selectedOutsiders.filter(outsider => outsider !== nameToCheck);
            let newTrigger = true;
            if (newOutsiders.length === 0) {
                newTrigger = false;
            }
            const newDatabaseSuggestions = [...this.state.suggestionsFromDatabase];
            newDatabaseSuggestions.push(suggestion);
            this.setState({
                selectedOutsiders: newOutsiders,
                suggestionsFromDatabase: newDatabaseSuggestions,
                outsiderTrigger: newTrigger
            })
        }
    }

    addRemoveSuggestion = (selectedPerson) => {
        const nameToCheck = selectedPerson;
        if (this.state.selectedPeople.indexOf(nameToCheck) === -1) {
            const newSelected = [...this.state.selectedPeople]
            newSelected.push(nameToCheck);
            this.setState({
                selectedPeople: newSelected,
            })
        }
        else {
            const newSelected = this.state.selectedPeople.filter(person => person !== nameToCheck);
            this.setState({
                selectedPeople: newSelected
            })
        }
    }

    addRemoveExistingMember = (member) => {
        let copyPeopleToRemove = [...this.state.peopleToRemove];
        if (copyPeopleToRemove.indexOf(member) === -1) {
            copyPeopleToRemove.push(member);
        } else {
            copyPeopleToRemove = copyPeopleToRemove.filter(removeMember => removeMember !== member);

        }
        this.setState({ peopleToRemove: copyPeopleToRemove })
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        if (this.props.appLoaded) {
            if (this.props.user === "guest") {
                this.props.history.push('/');
            } else {
                this.setState({ pageLoaded: true })
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.appLoaded && this.props.appLoaded) {
            if (this.props.user === "guest") {
                this.props.history.push('/');
            } else {
                this.setState({ pageLoaded: true })
            }
        }
    }

    handleChange = (e, typeOfChange, groupId) => {
        e.stopPropagation();
        let whichModal, suggestions, people, modalOpen;
        const theGroup = this.props.groups.filter(group => group._id.toString() === groupId.toString())
        const groupName = theGroup[0].name;
        switch (typeOfChange) {
            case "delete-group":
            case "edit-group-name":
            case "leave-group":
                whichModal = typeOfChange;
                modalOpen = true;
                suggestions = [];
                people = [];
                break;

            case "invite-people":
                modalOpen = true;
                whichModal = typeOfChange;
                let peopleToAdd = [];
                for (let i = 0; i < this.props.groups.length; i++) {
                    for (let j = 0; j < this.props.groups[i].people.length; j++) {
                        const nameCheck = this.props.groups[i].people[j];

                        if (theGroup[0].people.indexOf(nameCheck) === -1) {
                            if (peopleToAdd.indexOf(nameCheck) === -1 && this.props.user.nickname !== nameCheck) {
                                peopleToAdd.push(this.props.groups[i].people[j])
                            }
                        }
                    }
                }
                people = [];
                suggestions = peopleToAdd;
                break;

            case "remove-people":
                whichModal = typeOfChange;
                modalOpen = true;
                suggestions = [];
                people = [...theGroup[0].people]
                people = people.filter(person => person !== this.props.user.nickname)
                break;

            case "copy-id":
                const copyId = document.getElementById(`copy-id-input-field-${groupId}`);
                copyId.select();
                document.execCommand('Copy');
                break;

            default:
                return false;
        }
        if (document.getElementById('deactivate-checkbox') !== null) {
            document.getElementById('deactivate-checkbox').checked = false;
        }
        this.setState({
            error: false,
            errorMessage: "",
            groupName,
            modalOpen,
            outsiderTrigger: false,
            people,
            peopleToRemove: [],
            selectedGroup: groupId,
            selectedOutsiders: [],
            selectedPeople: [],
            success: false,
            successMessage: "",
            suggestionsTrigger: false,
            suggestionsFromDatabase: [],
            suggestions,
            warningCheck: false,
            whichModal
        })
    }

    handleChangeGroupName = (e) => {
        e.preventDefault();
        const newName = document.getElementById('new-group-name').value;
        if (newName !== "") {
            const manageGroupsPromise = manageGroupsRequest(this.state.whichModal, this.state.selectedGroup, null, null, newName);
            manageGroupsPromise.then(groupResponse => {
                const changedGroups = changeSingleGroup(this.props.groups, groupResponse.data.payload._id, groupResponse.data.payload);
                this.props.setGroups(changedGroups);
                this.props.setGroup(changedGroups[0]._id);
                this.props.setGroupName(changedGroups[0].name);
                this.setState({
                    modalOpen: false,
                    success: true,
                    successMessage: `You successfully changed the group's name!`,
                    whichModal: ""
                }, () => {
                    setTimeout(() => this.setState({ success: false, successMessage: "" }), 1000)
                })
            }).catch(err => {
                this.setState({
                    error: true,
                    errorMessage: err.response.data.message
                })
            })
        }
    }

    handleCheckbox = () => {
        const newCheckbox = !this.state.warningCheck;
        this.setState({ warningCheck: newCheckbox })
    }

    handleLeaveDelete = () => {
        let message = this.state.whichModal === "leave-group" ? "left" : "deleted";
        const manageGroupsPromise = manageGroupsRequest(this.state.whichModal, this.state.selectedGroup, null, null, null);
        manageGroupsPromise.then(groupResponse => {
            const changedGroups = removeGroup(this.props.groups, groupResponse.data.payload);
            this.props.setGroups(changedGroups);

            if (changedGroups > 0) {
                let statsObject = getShortStats(changedGroups, this.props.user.nickname);
                statsObject.balance = calculateBalance(changedGroups, this.props.user.nickname);
                this.props.setShortStats(statsObject);
                this.props.setGroup(changedGroups[0]._id);
                this.props.setGroupName(changedGroups[0].name);
            } else {
                this.props.setShortStats({ balance: 0, totalNumberOfBets: 0, waitingNotifications: 0 });
                this.props.setGroup("");
                this.props.setGroupName("");
            }

            this.setState({
                modalOpen: false,
                success: true,
                successMessage: `You successfully ${message} the group!`,
                whichModal: ""
            }, () => setTimeout(() => this.setState({ success: false, successMessage: "" }), 1000));
        }).catch(err => {
            this.setState({
                error: true,
                errorMessage: `Could not ${message} the group!`
            })
        })
    }

    handleMouseOver = (e, data, id) => {
        let mouseOverText;
        switch (data) {
            case "invite-people":
                mouseOverText = "Invite people to this group"
                break;

            case "remove-people":
                mouseOverText = "Remove people from this group"
                break;

            case "edit-group-name":
                mouseOverText = "Change group's name"
                break;

            case "copy-id":
                mouseOverText = "Copy Group's ID to send it to your friends"
                break;

            case "leave-group":
                mouseOverText = "Leave this group"
                break;

            case "delete-group":
                mouseOverText = "Delete this group"
                break;

            default:
                return false;
        }
        if (e.type === "mouseenter") {
            document.getElementById(`${data}-${id}`).classList.remove('display-none');
            document.getElementById(`${data}-${id}`).innerHTML = mouseOverText;
        } else {
            document.getElementById(`${data}-${id}`).classList.add('display-none');
            document.getElementById(`${data}-${id}`).innerHTML = ""
        }

    }

    handleRemoveMembers = (e) => {
        e.preventDefault();
        if (this.state.peopleToRemove.length > 0) {
            const removeMembersPromise = manageGroupsRequest(this.state.whichModal, this.state.selectedGroup, null, this.state.peopleToRemove, null, null);
            removeMembersPromise.then(groupResponse => {
                const changedGroups = changeSingleGroup(this.props.groups, groupResponse.data.payload._id, groupResponse.data.payload);
                let statsObject = getShortStats(changedGroups, this.props.user.nickname);
                statsObject.balance = calculateBalance(changedGroups, this.props.user.nickname);
                this.props.setGroups(changedGroups);
                this.props.setShortStats(statsObject);

                this.setState({
                    modalOpen: false,
                    success: true,
                    successMessage: `You successfully removed members from the group!`,
                    whichModal: ""
                }, () => {
                    setTimeout(() => this.setState({ success: false, successMessage: "" }), 1000)
                })
            }).catch(err => {
                this.setState({
                    error: true,
                    errorMessage: err.response.data.message
                }, () => {
                    setTimeout(() => this.setState({ error: false, errorMessage: "" }), 3000)
                })
            })
        }
    }

    handleSuggestionsFromDatabase = () => {
        const field = document.getElementById("search-users-to-add").value;
        if (field !== "") {
            const findUsersPromise = manageGroupsRequest("get users", null, null, null, null, field);
            findUsersPromise.then(suggestionResponse => {
                const filteredArray = joinArrays(suggestionResponse.data.payload, this.state.suggestions)
                let newFiltered = [];
                filteredArray.forEach(personDatabase => {
                    if (this.state.selectedOutsiders.indexOf(personDatabase) === -1) {
                        const theGroup = this.props.groups.filter(group => group._id.toString() === this.state.selectedGroup.toString());
                        if (theGroup[0].people.indexOf(personDatabase) === -1) {
                            newFiltered.push(personDatabase);
                        }
                    }
                })

                this.setState({
                    suggestionsFromDatabase: newFiltered,
                    suggestionsTrigger: newFiltered.length > 0 ? true : false
                })
            }).catch(err => {

            })
        }
        else {
            this.setState({
                suggestionsTrigger: false
            })
        }
    }

    hideMessages = () => {
        this.setState({
            error: false,
            errorMessage: "",
            success: false,
            successMessage: ""
        })
    }

    sendInvites = (e) => {
        e.preventDefault();
        const invitedPeople = [...this.state.selectedPeople, ...this.state.selectedOutsiders];
        if (invitedPeople.length > 0) {
            const sendInvitesPromise = manageGroupsRequest("invite-people", this.state.selectedGroup, invitedPeople, null, null, null);
            sendInvitesPromise.then(res => {
                this.setState({
                    modalOpen: false,
                    success: true,
                    successMessage: `You successfully invited user to the group!`,
                    whichModal: ""
                }, () => {
                    setTimeout(() => this.setState({ success: false, successMessage: "" }), 1000)
                })
            }).catch(err => {
                this.setState({
                    error: true,
                    errorMessage: err.response.data.message
                }, () => setTimeout(() => this.setState({ error: false, errorMessage: "" }), 3000))
            })
        }
    }

    render() {
        let groupLines;
        if (this.state.pageLoaded) {
            if (this.props.groups.length !== 0) {
                groupLines = this.props.groups.map(group => {
                    let selectedLine = false;
                    if (this.state.selectedGroup === group._id) {
                        selectedLine = true
                    }
                    return (
                        <GroupLine
                            admin={group.admin === this.props.user.nickname}
                            handleChange={this.handleChange}
                            handleMouseOver={this.handleMouseOver}
                            groupName={group.name}
                            id={group._id}
                            key={group._id}
                            selectedGroup={this.state.selectedGroup}
                            selectedLine={selectedLine}
                            whichData={this.state.whichModal} />
                    )
                })
            } else {
                groupLines = (<div>You are not part of any group!</div>)
            }
        }
        return (
            <div className={`main-container ${isMobile(480) ? "mobile-alternative-background" : "main-background"}`}>
                {this.state.pageLoaded ? <div className="basic-column-fx align-center-fx">
                    <div id="manage-title">Manage your groups</div>
                    {groupLines}
                    <div id="manage-help" className="basic-column-fx ">
                        <div>
                            <FontAwesomeIcon icon={faInfo} />
                            <span>Remove people, name change and delete group options are only available for groups where you are admin!</span>
                        </div>
                    </div>
                    {this.state.error ? <ErrorMessage text={this.state.errorMessage} /> : null}
                    {this.state.success ? <SuccessMessage text={this.state.successMessage} /> : null}
                    {this.state.modalOpen ? <div className="basic-fx justify-center-fx align-center-fx currently-changing-title">
                        <span>Currently changing {this.state.groupName}</span>
                    </div> : null}
                    <ManageGroupsModal
                        addRemoveOutsider={this.addRemoveOutsider}
                        addRemoveSuggestion={this.addRemoveSuggestion}
                        addRemoveExistingMember={this.addRemoveExistingMember}
                        handleSuggestionsFromDatabase={this.handleSuggestionsFromDatabase}
                        handleChangeGroupName={this.handleChangeGroupName}
                        handleCheckbox={this.handleCheckbox}
                        handleLeaveDelete={this.handleLeaveDelete}
                        handleRemoveMembers={this.handleRemoveMembers}
                        hideMessages={this.hideMessages}
                        outsiderTrigger={this.state.outsiderTrigger}
                        people={this.state.people}
                        peopleToRemove={this.state.peopleToRemove}
                        selectedGroup={this.state.selectedGroup}
                        selectedPeople={this.state.selectedPeople}
                        selectedOutsiders={this.state.selectedOutsiders}
                        suggestions={this.state.suggestions}
                        suggestionsFromDatabase={this.state.suggestionsFromDatabase}
                        suggestionsTrigger={this.state.suggestionsTrigger}
                        sendInvites={this.sendInvites}
                        warningCheck={this.state.warningCheck}
                        whichModal={this.state.whichModal} />
                    <ReturnButton
                        classToDisplay="return-button-space return-button-medium"
                        returnToMain={returnToMain.bind(null, this.props)}
                        text="Main menu" />
                </div> : <Loader loading={this.state.pageLoaded} />}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        appLoaded: state.appStates.appLoaded,
        groups: state.groups,
        needsUpdate: state.appStates.needsUpdate,
        user: state.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setNeedsUpdate: (bool) => {
            dispatch({ type: "appStates/setNeedsUpdate", payload: bool })
        },

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

export default connect(mapStateToProps, mapDispatchToProps)(ManageGroups);