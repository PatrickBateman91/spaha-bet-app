import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faSignInAlt, faCog } from '@fortawesome/free-solid-svg-icons';
import './styles.scss';

const GroupsHome = (props) => {
    return (
        <div className="home-groups-container basic-fx">
            <div className="home-groups-item basic-column-fx">
                <Link to="/create-new-group" className="basic-column-fx align-center-fx justify-center-fx">
                    <span>Create new group</span>
                    <FontAwesomeIcon icon={faPlusCircle} />
                </Link>
            </div>


            <div className="home-groups-item basic-column-fx">
                <Link to="join-new-group" className="basic-column-fx align-center-fx justify-center-fx">
                    <span>Join group</span>
                    <FontAwesomeIcon icon={faSignInAlt} />
                </Link>
            </div>


            <div className="home-groups-item basic-column-fx">
                <Link to="manage-groups" className="basic-column-fx align-center-fx justify-center-fx">
                    <span>Manage your groups</span>
                    <FontAwesomeIcon icon={faCog} />
                </Link>
            </div>

        </div>
    );
};

export default GroupsHome;