import axios from 'axios';
import { currentUrl } from '../Mode/Mode';

export const notificationRequests = (type, groupId, answer, userToJoin, notificationId) => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers: {
            Authentication: LS,
            type
        }
    }

    if (type === "read notifications") {
        return new Promise((resolve, reject) => {
            axios.post(`${currentUrl}/notifications`, {}, config).then(response => {
                return resolve(response);
            }).catch(err => {
                return reject(err);
            })
        })
    }
    else if (type === "accept user to group") {
        return new Promise((resolve, reject) => {
            axios.post(`${currentUrl}/notifications`, { groupId, answer, userToJoin, notificationId }, config).then(response => {
                return resolve(response);
            }).catch(err => {
                return reject(err);
            })
        })
    }
    else if (type === "accept group invite") {
        return new Promise((resolve, reject) => {
            axios.post(`${currentUrl}/notifications`, { groupId, answer, notificationId }, config).then(response => {
                return resolve(response);
            }).catch(err => {
                return reject(err);
            })
        })
    }

}