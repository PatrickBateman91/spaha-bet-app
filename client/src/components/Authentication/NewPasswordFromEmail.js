import React, { Fragment, Component } from 'react';
import { checkEmailLink, changePasswordFromEmail } from '../Axios/UserRequests';
import {emptyFieldsCheck, passwordCheck} from '../DumbComponents/SimpleFunctions';

class NewPasswordFromEmail extends Component {
    state = {
            emailValid : false,
            error:false,
            errorMessage:"",
            success:false,
            successMessage:""
        }
    

    componentDidMount() {
        const checkEmailPromise = checkEmailLink(this.props.match.params.uid, this.props.match.params.id);
        checkEmailPromise.then(res => {
            if (res.data === "Email link is valid!") {
                this.setState({emailValid : true})
            }
        }).catch(err => {
            this.props.history.push('/404')
        })
    }

    handleResetPassword = (e) => {
        e.preventDefault();
        const pass1 = document.getElementById('new-password1').value;
        const pass2 = document.getElementById('new-password2').value;
        if(!emptyFieldsCheck(pass1) || !emptyFieldsCheck(pass2)){
            this.setState({
                error:true,
                errorMessage:"Fields cannot be blank!"
            })
        }
        if(pass1 !== pass2){
            this.setState({
                error:true,
                errorMessage:"Passwords do not match!"
            })
        }
        if(!passwordCheck(pass1)){
            this.setState({
                error:true,
                errorMessage:"Password must be at least 6 characters long and include a number"
            })
        }
        const changePasswordPromise = changePasswordFromEmail(this.props.match.params.uid, this.props.match.params.id, pass1);
        changePasswordPromise.then(res => {
            this.setState({
                success:true,
                successMessage:"Password changed successfully! You can login now!"
            }, () => {
                setTimeout(() => this.props.history.push('/sign-in'), 1500);
            })
        }).catch(err => {
            this.setState({
                error:true,
                errorMessage: err.response.data
            }, () => {
                if(err.response.data !== "New password cannot be same as the old password!"){
                    setTimeout(() => this.props.history.push('/'), 1500);
                }
            })
        })
    }

    hideMessages = () => {
        this.setState({
            error:false,
            errorMessage:"",
            success:false,
            successMessage:""
        })
    }

    render() {
        return (
            <div className="main-container main-background">
   
                    {this.state.emailValid ? <Fragment>
                        <form name="reset-password" id="reset-password" onChange={this.hideMessages} onSubmit={this.handleResetPassword}>
                        <div id="change-account-holder" className="basic-column-fx justify-between-fx align-center-fx wrap-fx">
                    <div className="change-account-line">
                      <label htmlFor="new-password1">Enter new password</label>
                      <input type="password" name="new-password1" id="new-password1" placeholder="Enter new password" autoComplete="password"></input>
                    </div>
                    <div className="change-account-line">
                      <label htmlFor="new-password2">Retype new password</label>
                      <input type="password" name="new-password2" id="new-password2" placeholder="Retype password" autoComplete="password"></input>
                    </div>
                    {this.state.error ? <div className="error-message">{this.state.errorMessage}</div> : null}
                  {this.state.success ? <div className="success-message">{this.state.successMessage}</div> : null}
                  <div className="auth-button">
                    <button type="submit" form="reset-password">Reset password</button>
                  </div>
                  </div>
                  </form>
                    </Fragment> : null}
    

            </div>
        );
    }
};

export default NewPasswordFromEmail;