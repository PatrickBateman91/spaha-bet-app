import React, { Component } from 'react';
import ReturnButton from '../../MISC/ReturnButton';
import {currentUrl} from '../../MISC/Mode';
import { returnToMain } from '../../DumbComponents/SimpleFunctions';
import { getUserData, getPublicProfile } from '../../Axios/UserRequests';

class PublicProfile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pageLoaded: false
        }
    }

    componentDidMount() {
        window.scrollTo(0,0);
        const nickname = this.props.match.params.nickname;
        const getUserPromise = getUserData('get user');
        getUserPromise.then(responseUser => {
            const getProfilePromise = getPublicProfile(nickname);
            let imgSource;
            getProfilePromise.then(profileResponse => {
                if (profileResponse.data.imgSource) {
                    imgSource = `${currentUrl}\\${profileResponse.data.imgSource}`;
                } else {
                    imgSource = `${currentUrl}\\public\\general\\default-profile.png}`;
                }
                this.setState({
                    activeBets: profileResponse.data.activeBets,
                    balance: profileResponse.data.balance,
                    betsLost: profileResponse.data.betsLost,
                    betsWon: profileResponse.data.betsWon,
                    finishedBets: profileResponse.data.finishedBets,
                    groupNames: profileResponse.data.groupNames,
                    imgSource,
                    pageLoaded: true
                })
            }).catch(err => {
                this.setState({
                    error: true,
                    errorMessage: "Could not get user you are looking for!"
                })
            })
        }).catch(err => {
            this.props.history.push('/sign-in');
        })
    }

    render() {
        let groupNames;
        if (this.state.pageLoaded) {
            groupNames = this.state.groupNames.map((group, idx) => {
                return (<span className="public-profile-group-item" key={group + idx}>{group}</span>)
            })
        }
        return (
            <div className="main-container main-background">
           
                    <div id="public-profile-container" className="basic-column-fx justify-center-fx align-center-fx">
                    {this.state.pageLoaded ?
                        <div id="public-profile-holder" >
                            <div className="basic-fx justify-around-fx">
                                <div id="public-profile-picture-container">
                                    <img id="profile-picture" src={this.state.imgSource} alt="profile" />
                                </div>
                                <div className="public-data-container basic-column-fx">
                                    <div className="public-profile-name">{this.props.match.params.nickname}</div>
                                    <div className="basic-column-fx public-info-holder">
                                        <div className="basic-fx justify-between-fx"> <span>Total number of bets: </span><span>{this.state.activeBets + this.state.finishedBets}</span></div>
                                        <div className="basic-fx justify-between-fx"> <span>Balance:</span><span> {this.state.balance}$</span></div>
                                        <div className="basic-fx justify-between-fx"> <span>Active bets: </span><span>{this.state.activeBets}</span></div>
                                        <div className="basic-fx justify-between-fx"><span>Finished bets: </span><span>{this.state.finishedBets}</span></div>
                                        <div className="basic-fx justify-between-fx"> <span>Bets won: </span><span>{this.state.betsWon}</span></div>
                                        <div className="basic-fx justify-between-fx"><span>Bets lost: </span><span>{this.state.betsLost}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="public-group-holder basic-column-fx">
                                <span>Groups:</span>
                                {groupNames}
                                </div>
                        </div>
                                 : null}
                    </div>
           
                <ReturnButton returnToMain={returnToMain.bind(null, this.props)}
                    classToDisplay="return-add-button margin-bottom-none" text={"Main menu"} />
            </div>
        );
    }
}

export default PublicProfile;