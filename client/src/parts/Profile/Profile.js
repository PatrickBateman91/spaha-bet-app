import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { windowWidth } from '../../services/HelperFunctions/HelperFunctions';
import ProfilePicture from '../../components/ProfilePicture/ProfilePicture';
import SignOutNav from '../../parts/Menu/SignOutNav';
import './styles.scss';

const MainProfile = (props) => {
    let changedBalance;
    if (props.balance > 0) {
        changedBalance = (<div className="green-color"><span>+</span><span>{props.balance}$</span></div>)
    }
    else if (props.balance < 0) {
        changedBalance = (<div className="red-color"><span >-</span><span>{props.balance * -1}$</span></div>)
    }
    else {
        changedBalance = (<div><span>{props.balance}$</span></div>)
    }
    return (
        <div className="basic-fx justify-between-fx align-center-fx">
            <ProfilePicture imgSource={props.imgSource} hoverChangePicture={props.hoverChangePicture} reDirect={props.reDirect} />
            <div id="profile-info-container" className="basic-column-fx">
                <div className="relative basic-fx justify-between-fx" id="profile-info-home" onClick={props.handleAccountModal}>
                    <div>{props.user.nickname}</div>
                    <div id="profile-info-icon"><FontAwesomeIcon icon={props.accountModalOpen ? faCaretUp : faCaretDown} /></div>
                    {props.accountModalOpen ? <div id="profile-hidden-menu" onClick={props.handleAccountClick}>
                        <ul>
                            <li>Change account details</li>
                            <li>Change profile picture</li>
                            <li>Deactivate the account</li>
                        </ul>
                    </div> : null}
                </div>
                <div className="profile-info-item basic-fx justify-between-fx"><span>Active bets:</span><span> {props.totalNumberOfBets}</span></div>
                <div className="profile-info-item basic-fx justify-between-fx">Balance: {changedBalance}</div>
                <div id="profile-info-more-stats" className="basic-fx justify-center-fx" onClick={props.menuClick}><span>More stats</span></div>
                {windowWidth(768) ? null : <SignOutNav navAuth={props.navAuth} handleNavigationClick={props.handleNavigationClick} />}
            </div>
        </div>
    );
}


export default MainProfile;