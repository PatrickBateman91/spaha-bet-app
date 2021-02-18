import React, { Component, Fragment } from 'react';
import { createNewGroupRequest } from '../../../services/Axios/GroupRequests';
import { findUsersByNicknameRequest, getUserData } from '../../../services/Axios/UserRequests';
import { windowWidth as usingMobile, joinArrays, returnToMain } from '../../../services/HelperFunctions/HelperFunctions';
import ConfirmButton from '../../../components/Buttons/ConfirmButton';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import SearchUsers from '../../../components/SearchUsers/SearchUsers';
import Suggestions from '../../../components/SearchUsers/Suggestions';
import SuccessMessage from '../../../components/Messages/SuccessMessage';
import './styles.scss';

class CreateNewGroup extends Component {
    state = {
        pageLoaded: false,
        error: false,
        errorMessage: "",
        outsiderTrigger: false,
        selectedPeople: [],
        selectedOutsiders: [],
        success: false,
        successMessage: "",
        suggestions: [],
        suggestionsFromDatabase: [],
        suggestionsTrigger: false
    }


    addRemoveSuggestion = (selecterPerson) => {
        const nameToCheck = selecterPerson;
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
            let field = document.getElementById('search-users-to-add').value;
            if (suggestion.toLowerCase().startsWith(field)) {
                newDatabaseSuggestions.push(suggestion);
            }

            this.setState({
                selectedOutsiders: newOutsiders,
                suggestionsFromDatabase: newDatabaseSuggestions,
                outsiderTrigger: newTrigger
            })
        }
    }

    componentDidMount() {
        const getUserPromise = getUserData('get user');
        getUserPromise.then(resUser => {
            const getDataPromise = getUserData('get groups');
            getDataPromise.then(resData => {
                const groups = resData.data;
                let peopleToAdd = [];
                const userNickname = resUser.data.nickname;
                if (groups !== "User is not a part of any groups!") {
                    for (let i = 0; i < groups.length; i++) {
                        for (let j = 0; j < groups[i].people.length; j++) {
                            const nameCheck = groups[i].people[j];
                            if (peopleToAdd.indexOf(nameCheck) === -1 && userNickname !== nameCheck) {
                                peopleToAdd.push(groups[i].people[j])
                            }
                        }
                    }
                    this.setState({ suggestions: peopleToAdd, pageLoaded: true, user: resUser.data })
                } else {
                    this.setState({ suggestions: [], pageLoaded: true, user: resUser.data })
                }


            }).catch(err => {
                this.props.history.push('/sign-in')
            })
        }).catch(err => {
            this.props.history.push('/sign-in')
        })
    }

    handleSuggestionsFromDatabase = () => {
        const field = document.getElementById("search-users-to-add").value;
        if (field !== "") {
            const findUsersPromise = findUsersByNicknameRequest(field);
            findUsersPromise.then(res => {
                const filteredArray = joinArrays(res.data, this.state.suggestions)
                let newFiltered = [];
                filteredArray.forEach(personDatabase => {
                    if (this.state.selectedOutsiders.indexOf(personDatabase) === -1) {
                        newFiltered.push(personDatabase);
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

    uploadGroup = (e) => {
        e.preventDefault();
        const groupName = document.getElementById('new-group-name').value;
        if (groupName.length > 1) {
            const newGroupPromise = createNewGroupRequest(groupName, this.state.selectedPeople, this.state.selectedOutsiders);
            newGroupPromise.then(res => {
                this.setState({
                    success: true,
                    successMessage: "Group added successfully!"
                }, () => {
                    setTimeout(() => this.props.history.push('/'), 1000)
                })
            }).catch(err => {
                this.setState({
                    error: true,
                    errorMessage: err.response.data || "Group could not be added"
                })
            })
        }
        else {
            this.setState({
                error: true,
                errorMessage: "Group name has to have at least two characters!"
            })
        }
    }

    render() {
        return (
            <div className={`main-container basic-fx justify-center-fx align-center-fx ${!usingMobile(480) ? "alternative-mobile-background" : "main-background"}`}>
                <form name="create-new-group" id="create-new-group" onSubmit={this.uploadGroup}>
                    <div id="create-new-group-container" className="basic-column-fx align-center-fx justify-between-fx">
                        {this.state.pageLoaded ?
                            <Fragment>
                                <div className="create-new-group-line basic-fx justify-between-fx">
                                    <label htmlFor="new-group-name">Enter group name</label>
                                    <input
                                        onChange={this.hideMessages}
                                        type="text"
                                        name="new-group-name" id="new-group-name"
                                        placeholder="Group name"
                                        autoComplete="group"></input>
                                </div>
                                <div>Selected people:</div>
                                <div id="new-group-selected-people" className="basic-fx wrap-fx">
                                    {this.state.pageLoaded ? <Fragment>
                                        {this.state.selectedPeople.map(selectedPerson => {
                                            return (
                                                <div key={selectedPerson} className="relative" >
                                                    <span className="joint-not-chosen">{selectedPerson}</span>
                                                    <span className="remove-person" onClick={e => this.addRemoveSuggestion(selectedPerson)}>x</span>
                                                </div>
                                            )
                                        })}
                                    </Fragment> : null}
                                    {this.state.pageLoaded && this.state.outsiderTrigger > 0 ?
                                        <Fragment>
                                            {this.state.selectedOutsiders.map(outsider => {
                                                return (
                                                    <span className="relative" key={outsider} >
                                                        <span className="joint-not-chosen">{outsider}</span>
                                                        <span className="remove-person" onClick={e => this.addRemoveOutsider(outsider)}>x</span>
                                                    </span>
                                                )
                                            })}
                                        </Fragment> : null}
                                </div>
                                <span>Add people to the group</span>
                                {this.state.pageLoaded ? <div className="basic-fx wrap-fx">
                                    {this.state.suggestions.map(suggestion => {
                                        if (this.state.selectedPeople.indexOf(suggestion) === -1) {
                                            return (
                                                <div key={suggestion} >
                                                    <span className="not-chosen" onClick={e => this.addRemoveSuggestion(suggestion)}>{suggestion}</span>
                                                </div>
                                            )
                                        } else return null;

                                    })}
                                </div> : null}
                                <SearchUsers handleSuggestions={this.handleSuggestionsFromDatabase} />
                                {this.state.suggestionsTrigger ?
                                    <Suggestions addRemoveOutsider={this.addRemoveOutsider} suggestionsFromDatabase={this.state.suggestionsFromDatabase} /> : null}
                                {this.state.error ? <ErrorMessage text={this.state.errorMessage} /> : null}
                                {this.state.success ? <SuccessMessage text={this.state.successMessage} /> : null}
                                <ConfirmButton classToDisplay="confirm-button-space" form="create-new-group" text="Add group" type="submit" />
                                <ReturnButton
                                    classToDisplay="return-button-space return-button-medium"
                                    returnToMain={returnToMain.bind(null, this.props)}
                                    text="Main menu" />
                            </Fragment> : null}
                    </div>
                </form>
            </div>
        )
    }
}

export default CreateNewGroup;