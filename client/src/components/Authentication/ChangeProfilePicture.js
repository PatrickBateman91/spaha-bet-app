import React, {Component, Fragment} from 'react';
import {getUserData, uploadProfilePicture} from '../Axios/UserRequests';
import ReturnButton from '../MISC/ReturnButton';
import {returnToMain} from '../DumbComponents/SimpleFunctions';

class ChangeProfilePicture extends Component {
    state = {
            error:false,
            errorMessage:"",
            pageLoaded:false,
            selectedFile: null,
            success:false,
            successMessage:""
    }
    
    componentDidMount(){
        window.scrollTo(0,0);
        document.getElementById('root')
        const getUserPromise = getUserData('get user');

        getUserPromise.then(resUser => {
            this.setState({
                user:resUser.data
            }, () => {
                this.setState({pageLoaded:true})
        })
    })
            .catch(err => {
                this.props.history.push('/sign-in');
        })
    }

    handlePictureChange = (e) => {
        e.preventDefault();
        if(this.state.selectedFile){
            const formData = new FormData();
            formData.append('nickname', this.state.user.nickname)
            formData.append('file', this.state.selectedFile);
            const uploadPromise = uploadProfilePicture(formData);
            uploadPromise.then(res => {
                this.setState({
                    success:true,
                    successMessage:res.data
                }, () => {
                    setTimeout(() => this.props.history.push('/'), 1500)
                })
            }).catch(err => {
                this.setState({
                    error:true,
                    errorMessage:err.response.data
                })
            })
        } else{
            this.setState({error:true, errorMessage:"Please select adequate picture"})
        }

    }
    
    setPicture = (e) => {
        if(e.target.files.length === 1){
            if(e.target.files[0].type === "image/png" || e.target.files[0].type === "image/jpg" || e.target.files[0].type === "image/jpeg"){
              if(e.target.files[0].size < 3097152){
                this.setState({
                error:false,
                errorMessage:"",
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
          } else{
              this.setState({error:true, errorMessage:"File too big!"})
          }
    }

    render() {
        return (
            <div className="main-container main-background">
                {this.state.pageLoaded ? 
                    <Fragment>
                        <div className="basic-fx justify-center-fx align-center-fx change-profile-holder">
                            <div className="basic-column-fx justify-around-fx align-center-fx ">
                            <span>Change profile picture</span>
                            <form name="change-profile-picture-form" id="change-profile-picture-form" onSubmit={this.handlePictureChange} className="basic-column-fx justify-center-fx align-center-fx" encType="multipart/form-data">
                                <input type="file" name="profile-picture" onChange={this.setPicture} />
                                {this.state.error ? <div className="error-message">{this.state.errorMessage}</div> : null}
                                {this.state.success ? <div className="success-message">{this.state.successMessage}</div> : null}
                                <div className="auth-button">
                                    <button type="submit">Upload</button>
                                </div>
                            </form>
                            </div>
    
                        </div>
                        <ReturnButton returnToMain={returnToMain.bind(null, this.props)}
                            classToDisplay="return-add-button" text={"Main menu"} />
                    </Fragment> 
           : 
           null }
        </div>
        );
    }
}

export default ChangeProfilePicture;