import React, { Component } from 'react';
import ReturnButton from '../MISC/ReturnButton';
import { returnToMain, checkCorrectMailFormat, emptyFieldsCheck, passwordCheck } from '../DumbComponents/SimpleFunctions';
import { signInRequest, signUpRequest, getUserData} from '../Axios/UserRequests';


class AuthPage extends Component {
    state = {
      whichPage: "",
      pageLoaded: false,
      signInPage: {
        formName: 'login-form',
        firstFieldType: "text",
        labelOneName: "Email",
        labelTwoName: "Password",
        placeholderOne: "Email",
        placeholderTwo: "Password",
        formOneName: "email-login",
        formOneAutocomplete: "email",
        formTwoName: "password-login",
        formTwoAutocomplete: "password",
        buttonText: 'Sign in'
      },
      signUpPage: {
        formName: "sign-up-form",
        firstFieldType: "text",
        labelOneName: "Email",
        labelTwoName: "Password",
        labelThreeName: "Nickname",
        labelFourName: "Join group",
        labelFiveName: "Create new group",
        labelSixName: "Group name",
        labelSevenName:"Upload profile picture",
        placeholderOne: "Email",
        placeholderTwo: "Password",
        placeholderThree: "Nickname must be unique",
        placeholderFour: "Enter ID of the group you want to join",
        placeholderSix: "Enter group name",
        formOneName: "email-sign-up",
        formOneAutocomplete: "email",
        formTwoName: "password-sign-up",
        formTwoAutocomplete: "current-password",
        formThreeName: "nickname-sign-up",
        formThreeAutocomplete: "nickname",
        formFourName: "existing-bet-group",
        formFourAutocomplete: "bet-id",
        formFiveName: "create-new-group",
        formSixName: "new-group-name",
        formSixAutocomplete: "group-name",
        formSevenName:"upload-profile-picture",
        formSevenAutocomplete:"profile picture",
        buttonText: "Sign Up"
      },
      changePasswordPage: {
        formName: "change-password-form",
        firstFieldType: "password",
        labelOneName: "Old password",
        labelTwoName: "New password",
        labelThreeName: "Retype new password",
        formOneName: "change-password-first-field",
        formOneAutocomplete: "old-password",
        formTwoName: "change-password-second-field",
        formTwoAutocomplete: "new-password",
        formThreeName: "change-password-third-field",
        formThreeAutocomplete: "new-password",
        buttonText: "Confirm changes",
      },
      error: false,
      errorMessage: "",
      selectedFile : "",
      success: false,
      successMessage: "",
      newGroupCheck: false
    }

  componentDidMount() {
    window.scrollTo(0,0);
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
    if(e.target.files.length === 1){
      if(e.target.files[0].type === "image/png" || e.target.files[0].type === "image/jpg" || e.target.files[0].type === "image/jpeg"){
        if(e.target.files[0].size < 3097152){
          this.setState({
            selectedFile: e.target.files[0]
        }, () => {
        })
        } else{
          this.setState({
            error:true,
            errorMessage:"Max picture size is 3 mb"
          })
        }
      } else{
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
    const email = document.getElementById(this.state[this.state.whichPage].formOneName).value;
    const password = document.getElementById(this.state[this.state.whichPage].formTwoName).value;

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
      }, () => {;
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
    const email = document.getElementById(this.state[this.state.whichPage].formOneName).value;
    const password = document.getElementById(this.state[this.state.whichPage].formTwoName).value;
    const nickname = document.getElementById(this.state[this.state.whichPage].formThreeName).value;
    const newGroupCheck = this.state.newGroupCheck;
    const groupId = newGroupCheck ? null : document.getElementById(this.state[this.state.whichPage].formFourName).value;
    const groupName = newGroupCheck ? document.getElementById(this.state[this.state.whichPage].formSixName).value : null;

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

    if(nickname.length < 2){
      return this.setState({
        error: true,
        errorMessage:"Nickname must be at least 2 characters long!"
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
    formData.append('email' , email);
    formData.append('nickname' , nickname);
    formData.append('password' , password);
    formData.append('newGroup' , newGroupCheck);
    formData.append('groupId' , groupId);
    formData.append('groupName' , groupName);
    formData.append('file', this.state.selectedFile);
    const signUpPromise = signUpRequest('sign-up', formData);
    signUpPromise.then(res => {
    localStorage.setItem('bet-app-token', res.data.token)
    this.setState({
      success:true,
      successMessage:"Account created!"
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
      success:false,
      successMessage:"",
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
    if(this.state.whichPage === "signInPage"){
      if(e.target.id === "email-login"){
        if(checkCorrectMailFormat(e.target.value)){
          document.getElementById(e.target.id).classList.add("green-border");
        }
        else{
          document.getElementById(e.target.id).classList.remove("green-border");
        }
      } else if(e.target.id === "password-login"){
        if(passwordCheck(e.target.value)){
          document.getElementById(e.target.id).classList.add("green-border");
        }
        else{
          document.getElementById(e.target.id).classList.remove("green-border");
        }
      }
    }
    else if(this.state.whichPage ==="signUpPage"){
        if(e.target.id === "email-sign-up"){
          if(checkCorrectMailFormat(e.target.value)){
            document.getElementById(e.target.id).classList.add("green-border");
          }
          else{
            document.getElementById(e.target.id).classList.remove("green-border");
          }
        } else if(e.target.id === "password-sign-up"){
          if(passwordCheck(e.target.value)){
            document.getElementById(e.target.id).classList.add("green-border");
          }
          else{
            document.getElementById(e.target.id).classList.remove("green-border");
          }
        } else if(e.target.id === "nickname-sign-up"){
          if(e.target.value.length > 1){
            document.getElementById(e.target.id).classList.add("green-border");
          } else{
            document.getElementById(e.target.id).classList.remove("green-border");
          }
        } else if(e.target.id === "existing-bet-group"){
          if(e.target.value.length === 24){
            document.getElementById(e.target.id).classList.add("green-border");
          } else{
            document.getElementById(e.target.id).classList.remove("green-border");
          }
        } else if(e.target.id === "new-group-name"){
         
          if(e.target.value.length > 1){
            document.getElementById(e.target.id).classList.add("green-border");
          } else{
            document.getElementById(e.target.id).classList.remove("green-border");
          }
        }
    }
    this.setState({ 
    error: false, errorMessage: "", 
    success: false, successMessage: "" })
  }

  newGroupCheckFunction = () => {
    let newCheckState = document.getElementById(`${this.state[this.state.whichPage].formFiveName}`).checked;
    this.setState({
      newGroupCheck: newCheckState
    })
  }

  render() {
    return (
      <div className="auth-form-main-container basic-column-fx justify-center-fx">
        {this.state.pageLoaded ? <div className="basic-column-fx justify-between-fx align-center-fx wrap-fx">
          <form name={this.state[this.state.whichPage].formName} id={this.state[this.state.whichPage].formName} onChange={this.hideMessages} onSubmit={this.handleSubmit} encType="multipart/form-data">
            <div className="auth-form-holder basic-column-fx wrap-fx justify-center-fx align-center-fx">
              <div>

                <div className="auth-line">
                  <label htmlFor={this.state[this.state.whichPage].formOneName}>{this.state[this.state.whichPage].labelOneName}</label>
                  <input type={this.state[this.state.whichPage].firstFieldType} name={this.state[this.state.whichPage].formOneName} id={this.state[this.state.whichPage].formOneName} placeholder={this.state[this.state.whichPage].placeholderOne} autoComplete={this.state[this.state.whichPage].formOneAutocomplete}></input>
                </div>
                <div className="auth-line">
                  <label htmlFor={this.state[this.state.whichPage].formTwoName}>{this.state[this.state.whichPage].labelTwoName}</label>
                  <input type="password" name={this.state[this.state.whichPage].formTwoName} id={this.state[this.state.whichPage].formTwoName} placeholder={this.state[this.state.whichPage].placeholderTwo} autoComplete={this.state[this.state.whichPage].formTwoAutocomplete}></input>
                </div>
              </div>
              {this.state.whichPage === "signUpPage" || this.state.whichPage === "changePasswordPage" ? <div className="auth-line">
                <label htmlFor={this.state[this.state.whichPage].formThreeName}>{this.state[this.state.whichPage].labelThreeName}</label>
                <input type={this.state[this.state.whichPage].firstFieldType} name={this.state[this.state.whichPage].formThreeName} id={this.state[this.state.whichPage].formThreeName} placeholder={this.state[this.state.whichPage].placeholderThree} autoComplete={this.state[this.state.whichPage].formThreeAutocomplete}></input>
              </div> : null}
              {this.state.whichPage === "signUpPage" && !this.state.newGroupCheck ? <div className="auth-line">
                <label htmlFor={this.state[this.state.whichPage].formFourName}>{this.state[this.state.whichPage].labelFourName}</label>
                <input type="text" name={this.state[this.state.whichPage].formFourName} id={this.state[this.state.whichPage].formFourName} placeholder={this.state[this.state.whichPage].placeholderFour} autoComplete={this.state[this.state.whichPage].formFourAutocomplete}></input>
              </div> : null}
              {this.state.whichPage === "signUpPage" ? <div className="auth-line">
                <label htmlFor={this.state[this.state.whichPage].formFiveName}>{this.state[this.state.whichPage].labelFiveName}</label>
                <input type="checkbox" id={this.state[this.state.whichPage].formFiveName} onClick={this.newGroupCheckFunction} />
              </div> : null}
              {this.state.whichPage === "signUpPage" && this.state.newGroupCheck ? <div className="auth-line">
                <label htmlFor={this.state[this.state.whichPage].formSixName}>{this.state[this.state.whichPage].labelSixName}</label>
                <input type="text" name={this.state[this.state.whichPage].formSixName} id={this.state[this.state.whichPage].formSixName} placeholder={this.state[this.state.whichPage].placeholderSix} autoComplete={this.state[this.state.whichPage].formSixAutocomplete}></input>
              </div> : null}

              {this.state.whichPage === "signUpPage" ? <div className="basic-column-fx justify-center-fx align-center-fx upload-picture-form">
                <label htmlFor={this.state[this.state.whichPage].formSevenName}>{this.state[this.state.whichPage].labelSevenName}</label>
                <input type="file" accept="image/x-png,image/jpg,image/jpeg" name={this.state[this.state.whichPage].formSevenName} id={this.state[this.state.whichPage].formSevenName} onChange={this.handleProfilePicture}></input>
              </div> : null}

              {this.state.whichPage === "signInPage" ? <div className="basic-fx justify-center-fx auth-line" onClick={this.handleResendPassword}><span className="forgot-password-link">Forgot your password?</span></div> : null}

              {this.state.error ? <div className="error-message">{this.state.errorMessage}</div> : null}
              {this.state.success ? <div className="success-message">{this.state.successMessage}</div> : null}
              <div className="auth-button">
                <button type="submit" form={this.state[this.state.whichPage].formName}>{this.state[this.state.whichPage].buttonText}</button>
              </div>
            </div>
          </form>
          <ReturnButton classToDisplay="return-center-auth-button" returnToMain={returnToMain.bind(null, this.props)} whereTo='Home' text="Home" />
        </div> : null}
      </div>
    );
  }

}

export default AuthPage;