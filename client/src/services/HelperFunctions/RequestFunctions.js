import { getUserData } from '../Axios/UserRequests';
import { calculateBalance, getShortStats } from './HelperFunctions';

export const getUser = (props) => {
    const getUserPromise = getUserData('get user');
    getUserPromise.then(userResponse => {
        if (userResponse.data.code === 200) {
            props.updateUser(userResponse.data.payload.user);
            props.setLatestBets(userResponse.data.payload.latestBets.reverse());
            props.setPopularBets(userResponse.data.payload.popularBets);
            if (userResponse.data.payload.user.groups.length > 0) {
                const getDataPromise = getUserData('get groups');
                getDataPromise.then(groupResponse => {
                    if (groupResponse.data.code === 200) {
                        let statsObject = getShortStats(groupResponse.data.payload, userResponse.data.payload.user.nickname);
                        statsObject.balance = calculateBalance(groupResponse.data.payload, userResponse.data.payload.user.nickname);
                        let newestBets = [];
                        groupResponse.data.payload.forEach((group, idx) => {
                            if(newestBets.length < 10){
                                newestBets.push(...group.activeBets);
                            }
                        })
                        props.setShortStats(statsObject);
                        props.setGroup(groupResponse.data.payload[0]._id);
                        props.setGroupName(groupResponse.data.payload[0].name);
                    } else if (groupResponse.data.code >= 400) {
                        props.setErrorMessage(groupResponse.data.message);
                        props.setError(true);
                    }
                    props.setGroups(groupResponse.data.payload);
                    props.setAppLoaded(true);
                })
            } else {
                props.setAppLoaded(true);
            }
        } else if (userResponse.code >= 400) {
            props.setAppLoaded(true);
        }
    }).catch(err => {
        props.setErrorMessage(err.response.data.message);
        props.setError(true);
        props.setAppLoaded(true);
    })
}

export const getGroups = (props, nickname) => {
    const getDataPromise = getUserData('get groups');
    getDataPromise.then(groupResponse => {
        if (groupResponse.data.code === 200) {
            let statsObject = getShortStats(groupResponse.data.payload, nickname);
            statsObject.balance = calculateBalance(groupResponse.data.payload, nickname);
            props.setShortStats(statsObject);
            props.setGroup(groupResponse.data.payload[0]._id);
            props.setGroupName(groupResponse.data.payload[0].name);
        } else if (groupResponse.data.code >= 400) {
            props.setErrorMessage(groupResponse.data.message);
            props.setError(true);
        }
        props.setGroups(groupResponse.data.payload);
        props.setAppLoaded(true);
    })
}