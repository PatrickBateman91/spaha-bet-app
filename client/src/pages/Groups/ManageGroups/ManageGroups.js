import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { getUserData } from '../../../services/Axios/UserRequests';
import { manageGroupsRequest } from '../../../services/Axios/GroupRequests';
import { returnToMain, joinArrays } from '../../../services/HelperFunctions/HelperFunctions';
import GroupLine from '../../../components/Groups/ManageGroups/GroupLine';
import ManageGroupsModal from '../../../parts/Groups/ManageGroups/ManageGroupsModal';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import SuccessMessage from '../../../components/Messages/SuccessMessage';
import './styles.scss';

class ManageGroups extends Component {
    state = {
        error: false,
        errorMessage: "",
        groups: [],
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
    componentDidMount() {
        window.scrollTo(0, 0);
        this.reRenderComponent();
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

    handleChange = (e, typeOfChange, groupId) => {
        e.stopPropagation();
        let whichModal, suggestions, people, modalOpen;
        const theGroup = this.state.groups.filter(group => group._id.toString() === groupId.toString())
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
                for (let i = 0; i < this.state.groups.length; i++) {
                    for (let j = 0; j < this.state.groups[i].people.length; j++) {
                        const nameCheck = this.state.groups[i].people[j];

                        if (theGroup[0].people.indexOf(nameCheck) === -1) {
                            if (peopleToAdd.indexOf(nameCheck) === -1 && this.state.user.nickname !== nameCheck) {
                                peopleToAdd.push(this.state.groups[i].people[j])
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
                people = people.filter(person => person !== this.state.user.nickname)
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
            modalOpen,
            people,
            suggestions,
            selectedGroup: groupId,
            warningCheck: false,
            whichModal,
            error: false,
            errorMessage: "",
            groupName,
            outsiderTrigger: false,
            peopleToRemove: [],
            selectedPeople: [],
            selectedOutsiders: [],
            success: false,
            successMessage: "",
            suggestionsTrigger: false,
            suggestionsFromDatabase: []
        })
    }

    handleChangeGroupName = (e) => {
        e.preventDefault();
        const newName = document.getElementById('new-group-name').value;
        if (newName !== "") {
            const manageGroupsPromise = manageGroupsRequest(this.state.whichModal, this.state.selectedGroup, null, null, newName);
            manageGroupsPromise.then(res => {
                this.setState({
                    modalOpen: false,
                    success: true,
                    successMessage: `You successfully changed the group's name!`,
                    whichModal: ""
                }, () => {
                    setTimeout(() => this.reRenderComponent(), 1000)
                })
            }).catch(err => {
                this.setState({
                    error: true,
                    errorMessage: err.response.data || `Could not change the group's name!`
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
        manageGroupsPromise.then(res => {
            this.setState({
                modalOpen: false,
                success: true,
                successMessage: `You successfully ${message} the group!`,
                whichModal: ""
            }, () => {
                setTimeout(() => this.reRenderComponent(), 1000)
            })
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
        const removeMembersPromise = manageGroupsRequest(this.state.whichModal, this.state.selectedGroup, null, this.state.peopleToRemove, null, null);
        removeMembersPromise.then(res => {
            this.setState({
                modalOpen: false,
                success: true,
                successMessage: `You successfully removed members from the group!`,
                whichModal: ""
            }, () => {
                setTimeout(() => this.reRenderComponent(), 1000)
            })
        }).catch(err => {
            this.setState({
                error: true,
                errorMessage: `Could not remove members from the group!`
            })
        })
    }

    handleSuggestionsFromDatabase = () => {
        const field = document.getElementById("search-users-to-add").value;
        if (field !== "") {
            const findUsersPromise = manageGroupsRequest("get users", null, null, null, null, field);
            findUsersPromise.then(res => {
                const filteredArray = joinArrays(res.data, this.state.suggestions)
                let newFiltered = [];
                filteredArray.forEach(personDatabase => {
                    if (this.state.selectedOutsiders.indexOf(personDatabase) === -1) {
                        const theGroup = this.state.groups.filter(group => group._id.toString() === this.state.selectedGroup.toString());
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

    reRenderComponent = () => {
        const getUserPromise = getUserData('get user');
        getUserPromise.then(resUser => {
            const getDataPromise = getUserData('get groups');
            getDataPromise.then(resData => {
                if (resData.data !== "User is not a part of any groups!") {

                    const groups = resData.data;
                    this.setState({
                        error: false,
                        errorMessage: "",
                        groups: groups,
                        pageLoaded: true,
                        success: false,
                        successMessage: "",
                        user: resUser.data
                    })
                } else {
                    this.setState({
                        groups: [], pageLoaded: true, user: resUser.data
                    })
                }


            }).catch(err => {
                this.props.history.push('/sign-in')
            })
        }).catch(err => {
            this.props.history.push('/sign-in')
        })
    }

    sendInvites = (e) => {
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
                    setTimeout(() => this.reRenderComponent())
                })
            }).catch(err => {
                this.setState({
                    error: true,
                    errorMessage: `Could not invite people to the group!`
                })
            })
        }
    }

    render() {
        let groupLines;
        if (this.state.pageLoaded) {
            if (this.state.groups.length !== 0) {
                groupLines = this.state.groups.map(group => {
                    let selectedLine = false;
                    if (this.state.selectedGroup === group._id) {
                        selectedLine = true
                    }
                    return (
                        <GroupLine
                            admin={group.admin === this.state.user.nickname}
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
            <div className="main-container main-background">
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
                        classToDisplay="return-button-space"
                        returnToMain={returnToMain.bind(null, this.props)}
                        text="Main menu" />
                </div> : null}
            </div>
        );
    }
}

export default ManageGroups;