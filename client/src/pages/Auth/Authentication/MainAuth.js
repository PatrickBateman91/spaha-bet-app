import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fieldObjects } from './FieldsObjects';
import { checkCorrectMailFormat, emptyFieldsCheck, passwordCheck, returnToMain, shortenWord, isMobile } from '../../../services/HelperFunctions/HelperFunctions';
import { getGroups } from '../../../services/HelperFunctions/RequestFunctions';
import { signInRequest, signUpRequest } from '../../../services/Axios/UserRequests';
import AuthButton from '../../../components/Buttons/AuthButton';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import InputField from '../../../components/Auth/InputField';
import PasswordField from '../../../components/Auth/PasswordField';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import SuccessMessage from '../../../components/Messages/SuccessMessage';
import UploadPicture from '../../../components/Auth/UploadPicture';
import './styles.scss';

import { DndProvider, } from 'react-dnd'
import Backend from 'react-dnd-html5-backend';

class MainAuth extends Component {
  state = {
    whichPage: "",
    pageLoaded: false,
    error: false,
    errorMessage: "",
    passwordShown: false,
    selectedFile: "",
    success: false,
    successMessage: "",
    newGroupCheck: false
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.getElementById('root').style.height = "100%";
    if (this.props.user !== "guest") {
      this.props.history.push('/');
    } else {
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
    }
  }

  handleProfilePicture = (e) => {
    if (e.target.files.length === 1) {
      if (e.target.files[0].type === "image/png" || e.target.files[0].type === "image/jpg" || e.target.files[0].type === "image/jpeg") {
        if (e.target.files[0].size < 3097152) {
          this.setState({
            selectedFile: e.target.files[0]
          }, () => {
          })
        }

        else {
          this.setState({
            error: true,
            errorMessage: "Max picture size is 3 mb"
          })
        }
      }

      else {
        window.location.reload();
      }
    }
  }

  handlePictureDrop = (item) => {
    if (item && item.files && item.files.length === 1) {
      if (item.files[0].type === "image/png" || item.files[0].type === "image/jpg" || item.files[0].type === "image/jpeg") {
        if (item.files[0].size < 3097152) {
          this.setState({
            selectedFile: item.files[0]
          }, () => {
          })
        }

        else {
          this.setState({
            error: true,
            errorMessage: "Max picture size is 3 mb"
          })
        }
      }

      else {
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
    signInPromise.then(userResponse => {
      localStorage.setItem('bet-app-token', userResponse.data.payload.token);
      this.props.updateUser(userResponse.data.payload.user);
      this.props.setPopularBets(userResponse.data.payload.popularBets);
      this.props.setLatestBets(userResponse.data.payload.latestBets);

      if (userResponse.data.payload.user.groups.length > 0) {
        getGroups(this.props, userResponse.data.payload.user.nickname);
        this.setState({
          success: true,
          successMessage: "You have signed in successfully!"
        }, () => {
          setTimeout(() => this.props.history.push('/'), 500);
        })
      } else {
        this.props.setAppLoaded(true);
        this.setState({
          success: true,
          successMessage: "You have signed in successfully!"
        }, () => {
          setTimeout(() => this.props.history.push('/'), 500);
        })
      }
    }).catch(err => {
      this.setState({
        error: true,
        errorMessage: err.response.data.message
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
      return this.setState({
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
    signUpPromise.then(userResponse => {
      localStorage.setItem('bet-app-token', userResponse.data.payload.token);
      this.props.setLatestBets(userResponse.data.payload.latestBets);
      this.props.setPopularBets(userResponse.data.payload.popularBets);
      this.props.updateUser(userResponse.data.payload.user);
    

      if (userResponse.data.payload.user.groups.length > 0) {
        getGroups(this.props, userResponse.data.payload.user.nickname);

        this.setState({
          success: true,
          successMessage: "Account created!"
        }, () => {
          setTimeout(() => this.props.history.push('/'), 1500);
        })
      } else {
        this.props.setAppLoaded(true);
        this.setState({
          success: true,
          successMessage: "Account created!"
        }, () => {
          setTimeout(() => this.props.history.push('/'), 1500);
        })
      }
    }).catch(err => {
      this.setState({
        success: false,
        successMessage: "",
        error: true,
        errorMessage: err.response.data.message
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

  showPassword = () => {
    const newValue = !this.state.passwordShown;
    this.setState({ passwordShown: newValue });
  }

  render() {
    return (
      <DndProvider backend={Backend}>
        <div className={`auth-form-main-container basic-column-fx justify-center-fx ${isMobile(480) ? "mobile-alternative-background" : ""}`}>
          {this.state.pageLoaded ? <div className="basic-column-fx justify-between-fx align-center-fx wrap-fx">
            <form name={fieldObjects[this.state.whichPage].formName} id={fieldObjects[this.state.whichPage].formName} onChange={this.hideMessages} onSubmit={this.handleSubmit} encType="multipart/form-data">
              <div className="auth-form-holder basic-column-fx wrap-fx justify-center-fx align-center-fx">
                <div>
                  <InputField
                    autoComplete={fieldObjects[this.state.whichPage].formOneAutocomplete}
                    classToDisplay={`auth-line ${this.state.whichPage === "signInPage" ? "hide-placeholder" : ""}`}
                    id={fieldObjects[this.state.whichPage].formOneName}
                    label={fieldObjects[this.state.whichPage].labelOneName}
                    placeholder={fieldObjects[this.state.whichPage].placeholderOne}
                    type={fieldObjects[this.state.whichPage].firstFieldType} />

                  <PasswordField
                    autoComplete={fieldObjects[this.state.whichPage].formTwoAutocomplete}
                    classToDisplay={`auth-line ${this.state.whichPage === "signInPage" ? "hide-placeholder" : ""}`}
                    id={fieldObjects[this.state.whichPage].formTwoName}
                    label={fieldObjects[this.state.whichPage].labelTwoName}
                    passwordShown={this.state.passwordShown}
                    placeholder={fieldObjects[this.state.whichPage].placeholderTwo}
                    showPassword={this.showPassword}
                    type={this.state.passwordShown ? "text" : "password"} />
                </div>

                {this.state.whichPage === "signUpPage" ?
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

                {this.state.whichPage === "signUpPage" && this.state.newGroupCheck ?
                  <InputField
                    autoComplete={fieldObjects[this.state.whichPage].formSixAutocomplete}
                    classToDisplay="auth-line"
                    id={fieldObjects[this.state.whichPage].formSixName}
                    label={fieldObjects[this.state.whichPage].labelSixName}
                    placeholder={fieldObjects[this.state.whichPage].placeholderSix}
                    type="text" /> : null}

                {this.state.whichPage === "signUpPage" ? <div className="auth-line">
                  <label htmlFor={fieldObjects[this.state.whichPage].formFiveName}>{fieldObjects[this.state.whichPage].labelFiveName}</label>
                  <input type="checkbox" id={fieldObjects[this.state.whichPage].formFiveName} onClick={this.newGroupCheckFunction} />
                </div> : null}

                {this.state.whichPage === "signUpPage" ? <UploadPicture handleProfilePicture={this.handleProfilePicture} handlePictureDrop={this.handlePictureDrop} id={fieldObjects[this.state.whichPage].formSevenName} labelText={fieldObjects[this.state.whichPage].labelSevenName} selectedFile={this.state.selectedFile !== "" ? shortenWord(this.state.selectedFile.name, 30) : null} /> : null}

                {this.state.whichPage === "signInPage" ? <div className="basic-fx justify-center-fx" onClick={this.handleResendPassword}><span className="forgot-password-link">Forgot your password?</span></div> : null}

                {this.state.error ? <ErrorMessage classToDisplay="message-space" text={this.state.errorMessage} /> : null}
                {this.state.success ? <SuccessMessage classToDisplay="message-space" text={this.state.successMessage} /> : null}

                <AuthButton
                  classToDisplay="auth-button-space"
                  form={fieldObjects[this.state.whichPage].formName}
                  text={fieldObjects[this.state.whichPage].buttonText} />

              </div>
            </form>
            <ReturnButton classToDisplay="return-button-space return-button-medium" returnToMain={returnToMain.bind(null, this.props)} whereTo='Home' text="Home" />
          </div> : null}
        </div>
      </DndProvider>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setError: (bool) => {
      dispatch({ type: 'appStates/setError', payload: bool })
    },
    setErrorMessage: (message) => {
      dispatch({ type: 'appStates/setErrorMessage', payload: message })
    },
    setGroup: (group) => {
      dispatch({ type: 'appStates/setGroup', payload: group })
    },

    setGroupName: (name) => {
      dispatch({ type: 'appStates/setGroupName', payload: name })
    },

    setGroups: (groups) => {
      dispatch({ type: 'groups/setGroups', payload: groups })
    },

    setAppLoaded: (bool) => {
      dispatch({ type: 'appStates/setAppLoaded', payload: bool })
    },

    setLatestBets: (bets) => {
      dispatch({type: 'appStates/setLatestBets', payload: bets})
    },

    setPopularBets: (bets) => {
      dispatch({type: 'appStates/setPopularBets', payload:bets})
    },

    setShortStats: (stats) => {
      dispatch({ type: 'appStates/setShortStats', payload: stats })
    },

    updateUser: (user) => {
      dispatch({ type: "user/updateUser", payload: user });
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainAuth);