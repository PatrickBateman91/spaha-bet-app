import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getUser } from '../../services/HelperFunctions/RequestFunctions';
import './styles.scss';

const Footer = (props) => {
    const [firstLoad, setFirstLoad] = useState(true);
    useEffect(() => {
        if (firstLoad) {
            setFirstLoad(false);
            getUser(props);
        }
    }, [props, firstLoad])

    return (
        <div className={`basic-fx justify-center-fx footer-relative`}>
            <span>Created by Amar Spahić</span>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setError: (bool) => {
            dispatch({ type: 'appStates/setError', payload: bool })
        },
        setErrorMessage: (message) => {
            dispatch({ type: 'appStates/setErrorMessage', payload: message })
        },
        setGroup: (group) => {
            dispatch({ type: 'appStates/setGroup', payload: group })
        },

        setGroupName: (name) => {
            dispatch({ type: 'appStates/setGroupName', payload: name })
        },

        setGroups: (groups) => {
            dispatch({ type: 'groups/setGroups', payload: groups })
        },

        setLatestBets: (bets) => {
            dispatch({type: 'appStates/setLatestBets', payload: bets})
        },

        setAppLoaded: (bool) => {
            dispatch({ type: 'appStates/setAppLoaded', payload: bool })
        },

        setPopularBets: (bets) => {
            dispatch({type: 'appStates/setPopularBets', payload:bets})
        },

        setShortStats: (stats) => {
            dispatch({ type: 'appStates/setShortStats', payload: stats })
        },

        updateUser: (user) => {
            dispatch({ type: "user/updateUser", payload: user });
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Footer);