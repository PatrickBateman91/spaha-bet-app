import React, { useState, useEffect } from 'react';
import { currentUrl } from '../../../services/Mode/Mode';
import { getPublicProfile } from '../../../services/Axios/UserRequests';
import { returnToMain } from '../../../services/HelperFunctions/HelperFunctions';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import './styles.scss';

const PublicProfile = (props) => {
    window.scrollTo(0, 0);
    const nickname = props.match.params.nickname;
    const [statistics, setStatistics] = useState({});
    const [pageLoaded, setPageLoaded] = useState(false);

    useEffect(() => {
        if (!pageLoaded) {
            const getProfilePromise = getPublicProfile(nickname);
            let imgSource;
            getProfilePromise.then(profileResponse => {
                if (profileResponse.data.payload.imgSource) {
                    imgSource = `${currentUrl}\\${profileResponse.data.payload.imgSource}`;
                } else {
                    imgSource = `${currentUrl}\\public\\general\\default-profile.png`;
                }
                const statObject = {
                    activeBets: profileResponse.data.payload.activeBets,
                    balance: profileResponse.data.payload.balance,
                    betsLost: profileResponse.data.payload.betsLost,
                    betsWon: profileResponse.data.payload.betsWon,
                    finishedBets: profileResponse.data.payload.finishedBets,
                    groupNames: profileResponse.data.payload.groupNames,
                    imgSource,
                }
                setStatistics(statObject);
                setPageLoaded(true);
            }).catch(err => {
                props.history.push('/sign-in');
            })
        }
    }, [pageLoaded, props.history, nickname])

    let groupNames;
    if (pageLoaded) {
        groupNames = statistics.groupNames.map((group, idx) => {
            return (<span className="public-profile-group-item" key={group + idx}>{group}</span>)
        })
    }
    return (
        <div className="main-container main-background">
            <div id="public-profile-container" className="basic-column-fx justify-center-fx align-center-fx">
                {pageLoaded ?
                    <div id="public-profile-holder" >
                        <div className="basic-fx justify-around-fx">
                            <div id="public-profile-picture-container">
                                <img id="profile-picture" src={statistics.imgSource} alt="profile" />
                            </div>
                            <div className="public-data-container basic-column-fx">
                                <div className="public-profile-name">{props.match.params.nickname}</div>
                                <div className="basic-column-fx public-info-holder">
                                    <div className="basic-fx justify-between-fx">
                                        <span>Total number of bets:</span>
                                        <span>{statistics.activeBets + statistics.finishedBets}</span>
                                    </div>
                                    <div className="basic-fx justify-between-fx">
                                        <span>Balance:</span>
                                        <span>{statistics.balance}$</span>
                                    </div>
                                    <div className="basic-fx justify-between-fx">
                                        <span>Active bets:</span>
                                        <span>{statistics.activeBets}</span>
                                    </div>
                                    <div className="basic-fx justify-between-fx">
                                        <span>Finished bets:</span>
                                        <span>{statistics.finishedBets}</span>
                                    </div>
                                    <div className="basic-fx justify-between-fx">
                                        <span>Bets won:</span>
                                        <span>{statistics.betsWon}</span>
                                    </div>
                                    <div className="basic-fx justify-between-fx">
                                        <span>Bets lost: </span>
                                        <span>{statistics.betsLost}</span>
                                    </div>
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
            <ReturnButton returnToMain={returnToMain.bind(null, props)}
                classToDisplay="basic-fx justify-center-fx return-button-space return-button-medium" text={"Main menu"} />
        </div>
    );
}

export default PublicProfile;