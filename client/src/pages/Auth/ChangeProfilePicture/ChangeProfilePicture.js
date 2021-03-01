import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { uploadProfilePicture } from '../../../services/Axios/UserRequests';
import { returnToMain, windowWidth as usingMobile } from '../../../services/HelperFunctions/HelperFunctions';
import AuthButton from '../../../components/Buttons/AuthButton';
import Backend from 'react-dnd-html5-backend';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import Loader from '../../../components/Loaders/Loader';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import SuccessMessage from '../../../components/Messages/SuccessMessage';
import UploadPicture from '../../../components/Auth/UploadPicture';
import './styles.scss';


class ChangeProfilePicture extends Component {
    state = {
        error: false,
        errorMessage: "",
        pageLoaded: false,
        selectedFile: "",
        success: false,
        successMessage: ""
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

    handlePictureChange = (e) => {
        e.preventDefault();
        if (this.state.selectedFile) {
            const formData = new FormData();
            formData.append('nickname', this.props.user.nickname)
            formData.append('file', this.state.selectedFile);
            const uploadPromise = uploadProfilePicture(formData);
            uploadPromise.then(userResponse => {
                document.body.style.pointerEvents = 'none';
                document.body.style.cursor = "wait";
                this.props.updateUser(userResponse.data.payload);
                this.setState({
                    success: true,
                    successMessage: userResponse.data.message
                }, () => {
                    setTimeout(() => {
                        document.body.style.pointerEvents = 'auto';
                        document.body.style.cursor = "auto";
                        window.location.replace("https://spaha-betapp.netlify.app")
                    }, 1000)
                })
            }).catch(err => {
                this.setState({
                    error: true,
                    errorMessage: err.response.data.message
                })
            })
        }

        else {
            this.setState({ error: true, errorMessage: "Please select adequate picture" })
        }

    }

    handlePictureDrop = (item) => {
        if(item && item.files && item.files.length === 1){
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

    handleProfilePicture = (e) => {
        if (e.target.files.length === 1) {
            if (e.target.files[0].type === "image/png" || e.target.files[0].type === "image/jpg" || e.target.files[0].type === "image/jpeg") {
                if (e.target.files[0].size < 3097152) {
                    this.setState({
                        error: false,
                        errorMessage: "",
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
        } else {
            this.setState({ error: true, errorMessage: "File too big!" })
        }
    }

    render() {
        return (
            <DndProvider backend={Backend}>
            <div className={`main-container ${usingMobile(480) ? "gradient-background" : "alternative-mobile-background"}`}>
                {this.state.pageLoaded ?
                    <Fragment>
                        <div className="basic-fx justify-center-fx align-center-fx change-profile-holder">
                            <div className="basic-column-fx justify-around-fx align-center-fx ">
                                <form name="change-profile-picture-form" id="change-profile-picture-form" onSubmit={this.handlePictureChange} className="basic-column-fx justify-center-fx align-center-fx" encType="multipart/form-data">
                               <UploadPicture 
                               handlePictureDrop={this.handlePictureDrop}
                               handleProfilePicture={this.handleProfilePicture}
                               id='change-profile-picture' 
                               labelText="Upload new picture" 
                               selectedFile={this.state.selectedFile !== "" ? this.state.selectedFile.name : null}/> 

                                    {this.state.error ? <ErrorMessage text={this.state.errorMessage} /> : null}
                                    {this.state.success ? <SuccessMessage text={this.state.successMessage} /> : null}
                                    <AuthButton classToDisplay="auth-button-space" form="change-profile-picture-form" text="Upload" />
                                </form>
                            </div>
                        </div>
                        <ReturnButton returnToMain={returnToMain.bind(null, this.props)}
                            classToDisplay="justify-center-fx return-button-medium" text="Main menu" />
                    </Fragment> : <Loader loading={this.state.pageLoaded} />}
            </div>
            </DndProvider>
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
        updateUser: (user) => {
            dispatch({ type: "user/updateUser", payload: user })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangeProfilePicture);