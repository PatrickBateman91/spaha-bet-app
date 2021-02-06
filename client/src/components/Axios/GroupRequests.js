import axios from 'axios';
import {currentUrl} from '../MISC/Mode';

export const joinNewGroupRequest = (groupId) => {
    const LS = localStorage.getItem('bet-app-token');
const config = {
    headers:{
        Authentication: LS
    }
}
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/join-new-group`, {groupId}, config).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const createNewGroupRequest = (groupName, invitedPeople, invitedOutsiders) => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers:{
            Authentication: LS,
            type:"upload group"
        }
    }
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/create-new-group`, {groupName, invitedPeople, invitedOutsiders}, config).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const manageGroupsRequest = (type, groupId, invitedPeople, peopleToRemove, newGroupName, searchField) => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers:{
            Authentication: LS,
            type
        }
    }
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/manage-groups`, {groupId, invitedPeople, peopleToRemove, newGroupName, searchField}, config).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}