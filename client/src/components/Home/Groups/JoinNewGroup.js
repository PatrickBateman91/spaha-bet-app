import React, {Component} from 'react';
import ReturnButton from '../../MISC/ReturnButton';
import {returnToMain} from '../../DumbComponents/SimpleFunctions';
import {joinNewGroupRequest} from '../../Axios/GroupRequests';
import {getUserData} from '../../Axios/UserRequests';

class JoinNewGroup extends Component { 
    constructor(props){
        super(props);
        this.state={
            error:false,
            errorMessage:"",
            pageLoaded:false,
            success:false,
            successMessage:""
        }
    }
    componentDidMount(){
            const getUserPromise = getUserData('get user');
            getUserPromise.then(res => {
                this.setState({
                    pageLoaded:true
                })
            }).catch(err => {
                this.props.history.push('/sign-in');
            })
    }

    hideMessages = () => {
        this.setState({
            error:false,
            success:false
        })
    }

    joinNewGroupFunction = (e) => {
    e.preventDefault();
    const id = document.getElementById('join-new-group').value;
    if(id !== ""){
        const joinNewGroupPromise = joinNewGroupRequest(id);
        joinNewGroupPromise.then(res => {
            if(!res.data.error){
                this.setState({
                    success:true,
                    successMessage:"Your join request has been sent to group admin!"
                },() => {
                    setTimeout(returnToMain.bind(null, this.props), 1500)
                })
            } else{
                this.setState({
                    error:true,
                    errorMessage:res.data.errorMessage || "Could not add you to the group!"
                })
            }

        }).catch(err => {
            this.setState({
                error:true,
                errorMessage:err.response.data || "Could not add you to the group!"
            })
        })                                 
    }
    }
    
render(){
    return (
        <div className="basic-fx justify-center-fx align-center-fx main-container main-background">
            <form id="join-new-group-form" onSubmit={this.joinNewGroupFunction}>
        {this.state.pageLoaded ? <div className="join-new-group basic-column-fx justify-between-fx">
          <label htmlFor="join-new-group">Enter the ID of the group you want to join:</label>
              <input 
              onChange={this.hideMessages}
              type= "text"
              name="join-new-group"
              id="join-new-group"
              placeholder="Enter group ID"  
              autoComplete="Group id"
              ></input> 
                            {this.state.error ? <div className="error-message">{this.state.errorMessage}</div> :null}
            {this.state.success ? <div className="success-message">{this.state.successMessage}</div> :null}
              <div id="add-bet-button-container" className="basic-fx justify-center-fx">
              <button type="submit">Join group</button>
              </div>
    
            <ReturnButton 
    classToDisplay="return-center-button" 
    returnToMain={returnToMain.bind(null, this.props)} 
    text="Main menu" />
                </div> : null}   
                </form>
    </div>
    )
}

}

export default JoinNewGroup;