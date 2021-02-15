import React, { Component } from 'react';
import {fieldObjects} from './FieldsObjects';
import { returnToMain, checkCorrectMailFormat, emptyFieldsCheck, passwordCheck } from '../../../services/HelperFunctions/HelperFunctions';
import { signInRequest, signUpRequest, getUserData } from '../../../services/Axios/UserRequests';
import AuthButton from '../../../components/Buttons/AuthButton';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import InputField from '../../../components/Auth/InputField';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import SuccessMessage from '../../../components/Messages/SuccessMessage';

import './styles.scss';

class MainAuth extends Component {
  state = {
    whichPage: "",
    pageLoaded: false,
    error: false,
    errorMessage: "",
    selectedFile: "",
    success: false,
    successMessage: "",
    newGroupCheck: false
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    const getUserPromise = getUserData('get user');
    getUserPromise.then(resUser => {
      this.props.history.push('/');
    }).catch(err => {
      let whichPage;

      switch (this.props.match.path) {
        case '/sign-in':
          whichPage = "signInPage";
          break;

        case '/sign-up':
          whichPage = "signUpPage";
          break;

        default:
          break;
      }
      this.setState({
        pageLoaded: true,
        whichPage
      })
    })
  }

  handleProfilePicture = (e) => {
    if (e.target.files.length === 1) {
      if (e.target.files[0].type === "image/png" || e.target.files[0].type === "image/jpg" || e.target.files[0].type === "image/jpeg") {
        if (e.target.files[0].size < 3097152) {
          this.setState({
            selectedFile: e.target.files[0]
          }, () => {
          })
        } else {
          this.setState({
            error: true,
            errorMessage: "Max picture size is 3 mb"
          })
        }
      } else {
        window.location.reload();
      }
    }
  }

  handleResendPassword = (e) => {
    e.stopPropagation();
    this.props.history.push('/resend-password');
  }

  handleSignIn = () => {
    const path = this.props.match.path;
    const email = document.getElementById(fieldObjects[this.state.whichPage].formOneName).value;
    const password = document.getElementById(fieldObjects[this.state.whichPage].formTwoName).value;

    if (!checkCorrectMailFormat(email)) {
      return this.setState({
        error: true,
        errorMessage: "Email is not correctly formatted!"
      })
    }

    if (!emptyFieldsCheck(password)) {
      return this.setState({
        error: true,
        errorMessage: "Password field cannot be empty"
      })
    }

    const signInPromise = signInRequest(path, email, password);
    signInPromise.then(res => {
      this.setState({
        success: true,
        successMessage: "You have signed in successfully!"
      }, () => {
        ;
        setTimeout(this.props.history.push('/'), 1500);
      })
    }).catch(err => {
      console.log(err);
      console.log(err.response.data)
      this.setState({
        error: true,
        errorMessage: err.response.data || "Can't access page at the moment!"
      })
    })
  }

  handleSignUp = () => {
    const email = document.getElementById(fieldObjects[this.state.whichPage].formOneName).value;
    const password = document.getElementById(fieldObjects[this.state.whichPage].formTwoName).value;
    const nickname = document.getElementById(fieldObjects[this.state.whichPage].formThreeName).value;
    const newGroupCheck = this.state.newGroupCheck;
    const groupId = newGroupCheck ? null : document.getElementById(fieldObjects[this.state.whichPage].formFourName).value;
    const groupName = newGroupCheck ? document.getElementById(fieldObjects[this.state.whichPage].formSixName).value : null;

    //FRONT END CHECKS
    if (!checkCorrectMailFormat(email)) {
      return this.setState({
        error: true,
        errorMessage: "Email is not correctly formatted!"
      })
    }

    if (!passwordCheck(password)) {
      return this.setState({
        error: true,
        errorMessage: "Password must be between 6-16 characters long and has to contain at least 1 number!"
      })
    }

    if (!emptyFieldsCheck(nickname)) {
      return this.setState({
        error: true,
        errorMessage: "Nickname field cannot be empty"
      })
    }

    if (nickname.length < 2) {
      return this.setState({
        error: true,
        errorMessage: "Nickname must be at least 2 characters long!"
      })
    }

    if (newGroupCheck && !emptyFieldsCheck(groupName)) {
      this.setState({
        error: true,
        errorMessage: "Group name cannot be empty!"
      })
    }

    if (newGroupCheck === false && !emptyFieldsCheck(groupId)) {
      return this.setState({
        error: true,
        errorMessage: "Either group id must be provided or Create new group must be selected!"
      })
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('nickname', nickname);
    formData.append('password', password);
    formData.append('newGroup', newGroupCheck);
    formData.append('groupId', groupId);
    formData.append('groupName', groupName);
    formData.append('file', this.state.selectedFile);
    const signUpPromise = signUpRequest('sign-up', formData);
    signUpPromise.then(res => {
      localStorage.setItem('bet-app-token', res.data.token)
      this.setState({
        success: true,
        successMessage: "Account created!"
      }, () => {
        setTimeout(() => this.props.history.push('/'), 1500);
      })
    }).catch(err => {
      let errorMessage;
      let duplicateErrorCheck;
      if (err.response.data.errmsg && err.response.data.errmsg.indexOf("E11000 duplicate key error") !== -1) {
        duplicateErrorCheck = true;
      }

      if (duplicateErrorCheck) {
        if (err.response.data.errmsg.indexOf("nickname") !== -1) {
          errorMessage = `Nickname ${err.response.data.keyValue.nickname} already in use!`
        }
        else if (err.response.data.errmsg.indexOf("email") !== -1) {
          errorMessage = `Email ${err.response.data.keyValue.email} already in use!`
        }
      }
      else {
        errorMessage = err.response.data || "Our server is down. Unable to sign up at the moment!";
      }
      this.setState({
        success: false,
        successMessage: "",
        error: true,
        errorMessage: errorMessage
      })
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    switch (this.state.whichPage) {
      case "signInPage":
        this.handleSignIn();
        break;

      case "signUpPage":
        this.handleSignUp();
        break;

      default:
        throw new Error("Handle submit error u switch funkciji!")
    }
  }

  hideMessages = (e) => {
    if (this.state.whichPage === "signInPage") {
      if (e.target.id === "email-login") {
        if (checkCorrectMailFormat(e.target.value)) {
          document.getElementById(e.target.id).classList.add("green-border");
        }
        else {
          document.getElementById(e.target.id).classList.remove("green-border");
        }
      } else if (e.target.id === "password-login") {
        if (passwordCheck(e.target.value)) {
          document.getElementById(e.target.id).classList.add("green-border");
        }
        else {
          document.getElementById(e.target.id).classList.remove("green-border");
        }
      }
    }
    else if (this.state.whichPage === "signUpPage") {
      if (e.target.id === "email-sign-up") {
        if (checkCorrectMailFormat(e.target.value)) {
          document.getElementById(e.target.id).classList.add("green-border");
        }
        else {
          document.getElementById(e.target.id).classList.remove("green-border");
        }
      } else if (e.target.id === "password-sign-up") {
        if (passwordCheck(e.target.value)) {
          document.getElementById(e.target.id).classList.add("green-border");
        }
        else {
          document.getElementById(e.target.id).classList.remove("green-border");
        }
      } else if (e.target.id === "nickname-sign-up") {
        if (e.target.value.length > 1) {
          document.getElementById(e.target.id).classList.add("green-border");
        } else {
          document.getElementById(e.target.id).classList.remove("green-border");
        }
      } else if (e.target.id === "existing-bet-group") {
        if (e.target.value.length === 24) {
          document.getElementById(e.target.id).classList.add("green-border");
        } else {
          document.getElementById(e.target.id).classList.remove("green-border");
        }
      } else if (e.target.id === "new-group-name") {

        if (e.target.value.length > 1) {
          document.getElementById(e.target.id).classList.add("green-border");
        } else {
          document.getElementById(e.target.id).classList.remove("green-border");
        }
      }
    }
    this.setState({
      error: false, errorMessage: "",
      success: false, successMessage: ""
    })
  }

  newGroupCheckFunction = () => {
    let newCheckState = document.getElementById(`${fieldObjects[this.state.whichPage].formFiveName}`).checked;
    this.setState({
      newGroupCheck: newCheckState
    })
  }

  render() {
    return (
      <div className="auth-form-main-container basic-column-fx justify-center-fx">
        {this.state.pageLoaded ? <div className="basic-column-fx justify-between-fx align-center-fx wrap-fx">
          <form name={fieldObjects[this.state.whichPage].formName} id={fieldObjects[this.state.whichPage].formName} onChange={this.hideMessages} onSubmit={this.handleSubmit} encType="multipart/form-data">
            <div className="auth-form-holder basic-column-fx wrap-fx justify-center-fx align-center-fx">
              <div>
                <InputField
                  autoComplete={fieldObjects[this.state.whichPage].formOneAutocomplete}
                  classToDisplay="auth-line"
                  id={fieldObjects[this.state.whichPage].formOneName}
                  label={fieldObjects[this.state.whichPage].labelOneName}
                  placeholder={fieldObjects[this.state.whichPage].placeholderOne}
                  type={fieldObjects[this.state.whichPage].firstFieldType} />

                <InputField
                  autoComplete={fieldObjects[this.state.whichPage].formTwoAutocomplete}
                  classToDisplay="auth-line"
                  id={fieldObjects[this.state.whichPage].formTwoName}
                  label={fieldObjects[this.state.whichPage].labelTwoName}
                  placeholder={fieldObjects[this.state.whichPage].placeholderTwo}
                  type={"password"} />
              </div>

              {this.state.whichPage === "signUpPage" || this.state.whichPage === "changePasswordPage" ?
                <InputField
                  autoComplete={fieldObjects[this.state.whichPage].formThreeAutocomplete}
                  classToDisplay="auth-line"
                  id={fieldObjects[this.state.whichPage].formThreeName}
                  label={fieldObjects[this.state.whichPage].labelThreeName}
                  placeholder={fieldObjects[this.state.whichPage].placeholderThree}
                  type={fieldObjects[this.state.whichPage].firstFieldType} />
                : null}

              {this.state.whichPage === "signUpPage" && !this.state.newGroupCheck ?
                <InputField
                  autoComplete={fieldObjects[this.state.whichPage].formFourAutocomplete}
                  classToDisplay="auth-line"
                  id={fieldObjects[this.state.whichPage].formFourName}
                  label={fieldObjects[this.state.whichPage].labelFourName}
                  placeholder={fieldObjects[this.state.whichPage].placeholderFour}
                  type={fieldObjects[this.state.whichPage].firstFieldType} /> : null}

              {this.state.whichPage === "signUpPage" ? <div className="auth-line">
                <label htmlFor={fieldObjects[this.state.whichPage].formFiveName}>{fieldObjects[this.state.whichPage].labelFiveName}</label>
                <input type="checkbox" id={fieldObjects[this.state.whichPage].formFiveName} onClick={this.newGroupCheckFunction} />
              </div> : null}

              {this.state.whichPage === "signUpPage" && this.state.newGroupCheck ?
                <InputField
                  autoComplete={fieldObjects[this.state.whichPage].formSixAutocomplete}
                  classToDisplay="auth-line"
                  id={fieldObjects[this.state.whichPage].formSixName}
                  label={fieldObjects[this.state.whichPage].labelSixName}
                  placeholder={fieldObjects[this.state.whichPage].placeholderSix}
                  type="text" /> : null}

              {this.state.whichPage === "signUpPage" ? <div className="basic-column-fx justify-center-fx align-center-fx upload-picture-form">
                <label htmlFor={fieldObjects[this.state.whichPage].formSevenName}>{fieldObjects[this.state.whichPage].labelSevenName}</label>
                <input type="file" accept="image/x-png,image/jpg,image/jpeg" name={fieldObjects[this.state.whichPage].formSevenName} id={fieldObjects[this.state.whichPage].formSevenName} onChange={this.handleProfilePicture}></input>
              </div> : null}

              {this.state.whichPage === "signInPage" ? <div className="basic-fx justify-center-fx" onClick={this.handleResendPassword}><span className="forgot-password-link">Forgot your password?</span></div> : null}

              {this.state.error ? <ErrorMessage text={this.state.errorMessage} /> : null}
              {this.state.success ? <SuccessMessage text={this.state.successMessage} /> : null}

              <AuthButton 
              classToDisplay="auth-button-space" 
              form={fieldObjects[this.state.whichPage].formName} 
              text={fieldObjects[this.state.whichPage].buttonText} />

            </div>
          </form>
          <ReturnButton classToDisplay="return-button-space" returnToMain={returnToMain.bind(null, this.props)} whereTo='Home' text="Home" />
        </div> : null}
      </div>
    );
  }

}

export default MainAuth;