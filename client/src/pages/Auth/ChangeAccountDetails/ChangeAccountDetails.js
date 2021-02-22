import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserEdit } from '@fortawesome/free-solid-svg-icons';
import { checkCorrectMailFormat, emptyFieldsCheck, passwordCheck, returnToMain, windowWidth as usingMobile } from '../../../services/HelperFunctions/HelperFunctions';
import { changeAccountDetailsRequest } from '../../../services/Axios/UserRequests';
import { fieldsObjects } from './FieldsObject';
import AuthButton from '../../../components/Buttons/AuthButton';
import ChangeDataLayout from '../../../parts/Groups/ManageGroups/ChangeDataLayout';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import InputField from '../../../components/Auth/InputField';
import Loader from '../../../components/Loaders/Loader';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import SuccessMessage from '../../../components/Messages/SuccessMessage';
import './styles.scss';

class ChangeAccountDetails extends Component {
  state = {
    whichPage: "",
    pageLoaded: false,
    error: false,
    errorMessage: "",
    success: false,
    successMessage: "",
    selected: false,
    selectedChange: "",
    newGroupCheck: false
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.getElementById('root').style.height = "100%";
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

  handleChangeEmail = () => {
    const email1 = document.getElementById(fieldsObjects[this.state.whichPage].formTwoName).value;
    const email2 = document.getElementById(fieldsObjects[this.state.whichPage].formThreeName).value;

    if (email1 !== email2) {
      return this.setState({
        error: true,
        errorMessage: "Emails do not match!"
      })
    }

    if (!checkCorrectMailFormat(email1)) {
      return this.setState({
        error: true,
        errorMessage: "Email is not correctly formatted!"
      })
    }

    if (this.props.user.email === email1) {
      return this.setState({
        error: true,
        errorMessage: "New email can't be the same as the old!"
      })
    }

    const changeEmailPromise = changeAccountDetailsRequest("email", null, null, email1, null);
    changeEmailPromise.then(emailResponse => {
      document.body.style.pointerEvents = 'none';
      document.body.style.cursor = "wait";
      this.props.changeEmail(emailResponse.data.payload);
      this.setState({
        success: true,
        successMessage: emailResponse.data.message
      }, () => {
        setTimeout(() => {
          document.body.style.pointerEvents = 'auto';
          document.body.style.cursor = "auto";
          this.props.history.push('/')
        }, 1500);
      })
    }).catch(err => {
      this.setState({
        error: true,
        errorMessage: err.response.data.message
      })
    })

  }

  handleChangeNickname = () => {
    const nickname = document.getElementById(fieldsObjects[this.state.whichPage].formThreeName).value;
    if (nickname.length < 2) {
      return this.setState({
        error: true,
        errorMessage: "Nickname must be at least 2 characters long!"
      })
    }
    if (nickname === this.props.user.nickname) {
      return this.setState({
        error: true,
        errorMessage: "New nickname cannot be same as old!"
      })
    }

    const changeNicknamePromise = changeAccountDetailsRequest("nickname", null, null, null, nickname);
    changeNicknamePromise.then(nicknameResponse => {
      document.body.style.pointerEvents = 'none';
      document.body.style.cursor = "wait";
      this.props.changeNickname(nicknameResponse.data.payload);

      this.setState({
        success: true,
        successMessage: nicknameResponse.data.message
      }, () => {
        setTimeout(() => {
          document.body.style.pointerEvents = 'auto';
          document.body.style.cursor = "auto";
          window.location.reload();
        }, 500);
      })
    }).catch(err => {
      this.setState({
        error: true,
        errorMessage: err.response.data.message
      })
    })
  }

  handleChangePassword = () => {
    const oldPassword = document.getElementById(fieldsObjects[this.state.whichPage].formOneName).value;
    const newPassword1 = document.getElementById(fieldsObjects[this.state.whichPage].formTwoName).value;
    const newPassword2 = document.getElementById(fieldsObjects[this.state.whichPage].formThreeName).value;

    if (newPassword1 !== newPassword2) {
      return this.setState({
        error: true,
        errorMessage: "Passwords do not match!"
      })
    }

    if (!emptyFieldsCheck(oldPassword) || !emptyFieldsCheck(newPassword1)) {
      return this.setState({
        error: true,
        errorMessage: "Forms cannot be blank!"
      })
    }

    if (!passwordCheck(newPassword1)) {
      return this.setState({
        error: true,
        errorMessage: "Password must be between 6-16 characters long and has to contain at least 1 number!"
      })
    }

    if (oldPassword === newPassword1) {
      return this.setState({
        error: true,
        errorMessage: "Old password can't be the same as the new password!"
      })
    }
    const changePasswordPromise = changeAccountDetailsRequest("password", oldPassword, newPassword1, null, null);
    changePasswordPromise.then(res => {
      document.body.style.pointerEvents = 'none';
      document.body.style.cursor = "wait";
      this.setState({
        success: true,
        successMessage: res.data.message
      }, () => {
        setTimeout(() => {
          document.body.style.pointerEvents = 'auto';
          document.body.style.cursor = "auto";
          window.location.replace('https://spaha-betapp.netlify.app');
        }, 500);
      })
    }).catch(err => {
      this.setState({
        error: true,
        errorMessage: err.response.data.message
      })
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.selectedChange === "Password") {
      this.handleChangePassword();
    }
    else if (this.state.selectedChange === "Email") {
      this.handleChangeEmail();
    }
    else if (this.state.selectedChange === "Nickname") {
      this.handleChangeNickname();
    }
  }

  handleSelect = (type) => {
    if (this.state.selectedChange === type) {
      this.setState({
        error: false,
        errorMessage: "",
        selected: false,
        selectedChange: "",
        whichPage: ""
      })
    } else {
      if (this.state.selectedChange === "Password") {
        document.getElementById('change-password-first-field').value = "";
        document.getElementById('change-password-second-field').value = "";
        document.getElementById('change-password-third-field').value = "";
      }
      else if (this.state.selectedChange === "Email") {
        document.getElementById('change-email-second-field').value = "";
        document.getElementById('change-email-third-field').value = "";
      }
      else if (this.state.selectedChange === "Nickname") {
        document.getElementById('change-nickname-third-field').value = "";
      }
      this.setState({
        error: false,
        errorMessage: "",
        selected: true,
        selectedChange: type,
        whichPage: `change${type}Page`
      })
    }
  }

  hideMessages = () => {
    this.setState({ error: false, errorMessage: "", success: false, successMessage: "" })
  }

  newGroupCheckFunction = () => {
    let newCheckState = document.getElementById(`${fieldsObjects[this.state.whichPage].formFiveName}`).checked;
    this.setState({
      newGroupCheck: newCheckState
    })
  }

  render() {
    return (
      <div className={`main-container basic-column-fx align-center-fx ${usingMobile(480) ? "main-background" : "mobile-alternative-background"}`}>
        {this.state.pageLoaded ?
          <div id="change-account-container">
            <div className="change-account-title">Account details:</div>
            <div className="account-full-line basic-fx justify-between-fx">
              <div>Nickname:</div>
              <div>{this.props.user.nickname}</div>
              <FontAwesomeIcon className={this.state.selectedChange === "Nickname" ? "bigger-user-edit" : ""} icon={faUserEdit} onClick={() => this.handleSelect("Nickname")} />
            </div>
            <div className="account-full-line basic-fx justify-between-fx">
              <div>Email:</div>
              <div>{this.props.user.email}</div>
              <FontAwesomeIcon className={this.state.selectedChange === "Email" ? "bigger-user-edit" : ""} icon={faUserEdit} onClick={() => this.handleSelect("Email")} />
            </div >
            <div className="account-full-line basic-fx justify-between-fx">
              <div>Password:</div>
              <div>***********</div>
              <FontAwesomeIcon className={this.state.selectedChange === "Password" ? "bigger-user-edit" : ""} icon={faUserEdit} onClick={() => this.handleSelect("Password")} />
            </div>
          </div> : <Loader loading={this.state.pageLoaded} />}

        {this.state.selected ? <ChangeDataLayout className="justify-center-fx align-center-fx wrap-fx" id="change-account-holder">

          <form name={fieldsObjects[this.state.whichPage].formName} id={fieldsObjects[this.state.whichPage].formName} onChange={this.hideMessages} onSubmit={this.handleSubmit}>
            <div className="auth-form-holder basic-column-fx wrap-fx justify-center-fx align-center-fx">
              <div className="auth-fields">

                {this.state.selectedChange === "Password" ?
                  <InputField
                    autoComplete={fieldsObjects[this.state.whichPage].formOneAutocomplete}
                    classToDisplay="change-account-line"
                    id={fieldsObjects[this.state.whichPage].formOneName}
                    label={fieldsObjects[this.state.whichPage].labelOneName}
                    placeholder={fieldsObjects[this.state.whichPage].placeholderOne}
                    type={fieldsObjects[this.state.whichPage].firstFieldType} /> : null}

                {this.state.selectedChange !== "Nickname" ? <InputField
                  autoComplete={fieldsObjects[this.state.whichPage].formTwoAutocomplete}
                  classToDisplay="change-account-line"
                  id={fieldsObjects[this.state.whichPage].formTwoName}
                  label={fieldsObjects[this.state.whichPage].labelTwoName}
                  placeholder={fieldsObjects[this.state.whichPage].placeholderTwo}
                  type={this.state.selectedChange === "Password" ? "password" : "text"} /> : null}

                <InputField
                  autoComplete={fieldsObjects[this.state.whichPage].formThreeAutocomplete}
                  classToDisplay="change-account-line"
                  id={fieldsObjects[this.state.whichPage].formThreeName}
                  label={fieldsObjects[this.state.whichPage].labelThreeName}
                  placeholder={fieldsObjects[this.state.whichPage].placeholderThree}
                  type={this.state.selectedChange === "Password" ? "password" : "text"} />
              </div>

              {this.state.error ? <ErrorMessage text={this.state.errorMessage} /> : null}
              {this.state.success ? <SuccessMessage text={this.state.successMessage} /> : null}
              <AuthButton classToDisplay="auth-button-space" form={fieldsObjects[this.state.whichPage].formName} text={fieldsObjects[this.state.whichPage].buttonText} />
            </div>
          </form>
        </ChangeDataLayout> : <div className="empty-change-account-div basic-fx align-center-fx justify-center-fx">
            <span>What would you like to change?</span>
          </div>}
        <ReturnButton returnToMain={returnToMain.bind(null, this.props)}
          classToDisplay="return-button-space return-button-medium" text={"Main menu"} />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    appLoaded: state.appStates.appLoaded,
    user: state.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    changeEmail: (email) => {
      dispatch({ type: 'user/changeEmail', payload: email });
    },

    changeNickname: (nickname) => {
      dispatch({ type: 'user/changeNickname', payload: nickname });
    },

    setGroups: (groups) => {
      dispatch({ type: 'groups/setGroups', payload: groups });
    },

    setShortStats: (stats) => {
      dispatch({ type: 'appStates/setShortStats', payload: stats });
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangeAccountDetails);