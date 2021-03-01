import React from 'react';
import { currentUrl } from '../../services/Mode/Mode';
import './styles.scss';

const ProfilePicture = (props) => {
    let profilePicture;
    if (props.imgSource) {
        profilePicture = `${currentUrl}\\${props.imgSource}`;
        setTimeout(() => {
            try {
                document.getElementById('profile-picture-container').childNodes[1].style.border = "border:6px ridge ##961F44;";
            } catch (err) {
                console.log(err);
            }
        })
    } else {
        profilePicture = `${currentUrl}\\public\\general\\default-profile.png`;
        setTimeout(() => {
            try {
                document.getElementById('profile-picture-container').childNodes[1].style.border = "none";
            } catch (err) {
            }
        })
    }
    return (
        <div id="profile-picture-container" >
            <div id="profile-picture-hidden-div" onClick={ e => props.reDirect(e, '/change-profile-picture')} onMouseLeave={props.hoverChangePicture} className="display-none basic-fx align-center-fx justify-center-fx">
                <span className="profile-picture-change-span">Change profile picture</span>
            </div>
            <img src={profilePicture} alt="profile" onMouseEnter={props.hoverChangePicture} />
        </div>
    );
};

export default ProfilePicture;