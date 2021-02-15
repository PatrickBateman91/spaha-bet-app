import React, { Component } from 'react';
import { getUserData } from '../../../services/Axios/UserRequests';
import { joinNewGroupRequest } from '../../../services/Axios/GroupRequests';
import { returnToMain } from '../../../services/HelperFunctions/HelperFunctions';
import ConfirmButton from '../../../components/Buttons/ConfirmButton';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import SuccessMessage from '../../../components/Messages/SuccessMessage';
import './styles.scss';

class JoinNewGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: false,
            errorMessage: "",
            pageLoaded: false,
            success: false,
            successMessage: ""
        }
    }
    componentDidMount() {
        const getUserPromise = getUserData('get user');
        getUserPromise.then(res => {
            this.setState({
                pageLoaded: true
            })
        }).catch(err => {
            this.props.history.push('/sign-in');
        })
    }

    hideMessages = () => {
        this.setState({
            error: false,
            success: false
        })
    }

    joinNewGroupFunction = (e) => {
        e.preventDefault();
        const id = document.getElementById('join-new-group').value;
        if (id !== "") {
            const joinNewGroupPromise = joinNewGroupRequest(id);
            joinNewGroupPromise.then(res => {
                if (!res.data.error) {
                    this.setState({
                        success: true,
                        successMessage: "Your join request has been sent to group admin!"
                    }, () => {
                        setTimeout(returnToMain.bind(null, this.props), 1500)
                    })
                } else {
                    this.setState({
                        error: true,
                        errorMessage: res.data.errorMessage || "Could not add you to the group!"
                    })
                }

            }).catch(err => {
                this.setState({
                    error: true,
                    errorMessage: err.response.data || "Could not add you to the group!"
                })
            })
        }
    }

    render() {
        return (
            <div className="basic-fx justify-center-fx align-center-fx main-container main-background">
                <form id="join-new-group-form" onSubmit={this.joinNewGroupFunction}>
                    {this.state.pageLoaded ? <div className="join-new-group basic-column-fx justify-between-fx">
                        <label htmlFor="join-new-group">Enter the ID of the group you want to join:</label>
                        <input
                            onChange={this.hideMessages}
                            type="text"
                            name="join-new-group"
                            id="join-new-group"
                            placeholder="Enter group ID"
                            autoComplete="Group id"
                        ></input>
                        {this.state.error ? <ErrorMessage text={this.state.errorMessage} /> : null}
                        {this.state.success ? <SuccessMessage text={this.state.successMessage} /> : null}
                        <ConfirmButton classToDisplay="basic-fx justify-center-fx confirm-button-space" form="join-new-group-form" text="Join group" type="submit" />
                        <ReturnButton classToDisplay="justify-center-fx return-button-space" returnToMain={returnToMain.bind(null, this.props)} text="Main menu" />
                    </div> : null}
                </form>
            </div>
        )
    }

}

export default JoinNewGroup;