import axios from 'axios';
import {currentUrl} from '../MISC/Mode';

export const finishBetRequest = (type, groupId, bet, winner) => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers:{
            Authentication: LS,
            type
        }
    }
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/active-bets`, {groupId, bet, winner}, config).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const editBetRequest = (type, groupId, bet) => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers:{
            Authentication: LS,
            type
        }
    }

    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/active-bets`, {groupId, bet}, config).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const uploadBetRequest = (editMode, editModeID, selectedGroup, bet) => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers:{
            Authentication: LS
        }
    }
        return new Promise((resolve, reject) => {
                axios.post(`${currentUrl}/add-bet`, 
                {editMode, editModeID, selectedGroup, bet}, config).then(response => {
                return resolve(response);
                }).catch(err => {
                return reject(err);
                })
        })
}

export const uploadApprovalRequest = (type, betId, groupId, answer) => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers:{
            Authentication: LS,
            type
        }
    }

    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/bet-approvals`, {betId, groupId, answer}, config).then(response => {
            resolve(response);
        }).catch(err => {
            reject(err);
        })
    })
}
    