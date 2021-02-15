import axios from 'axios';
import { currentUrl } from '../Mode/Mode';


export const signInRequest = (path, email, password) => {
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}${path}`, {
            email, password
        }).then(response => {
            localStorage.setItem('bet-app-token', response.data.token)
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const signUpRequest = (path, formData) => {
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/${path}`, formData).then(response => {
            resolve(response);
        }).catch(err => {
            reject(err);
        })
    })
}

export const signOutRequest = () => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers: {
            Authentication: LS
        }
    }
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/sign-out`, {}, config).then(response => {
            localStorage.removeItem('bet-app-token');
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const changeAccountDetailsRequest = (type, oldPassword, newPassword, email, nickname) => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers: {
            Authentication: LS,
            type
        }
    }
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/change-account-details`, {
            oldPassword, newPassword, email, nickname
        }, config).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const findUsersByNicknameRequest = (nickname) => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers: {
            Authentication: LS,
            type: "get users"
        }
    }
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/create-new-group`, { nickname }, config).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const getUserData = (type) => {
    let LS = localStorage.getItem('bet-app-token');
    if (LS === null) {
        LS = "guest";
    }
    const config = {
        headers: {
            Authentication: LS,
            type: type
        }
    }

    return new Promise((resolve, reject) => {
        axios.get(`${currentUrl}/`, config).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const deactivateAccount = () => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers: {
            Authentication: LS
        }
    }
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/deactivate-account`, {}, config).then(response => {
            localStorage.removeItem('bet-app-token');
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const resendPasswordRequest = (email) => {
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/resend-password`, { email }).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const uploadProfilePicture = (file) => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers: {
            Authentication: LS
        }
    }
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/change-profile-picture`, file, config).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const checkEmailLink = (uid, id) => {
    return new Promise((resolve, reject) => {
        axios.get(`${currentUrl}/reset-password/${uid}/${id}`).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const changePasswordFromEmail = (uid, id, password) => {
    return new Promise((resolve, reject) => {
        axios.post(`${currentUrl}/reset-password/${uid}/${id}`, { password }).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}

export const getPublicProfile = (nickname) => {
    const LS = localStorage.getItem('bet-app-token');
    const config = {
        headers: {
            Authentication: LS,
            data: nickname
        }
    }
    const lowerCaseNickname = nickname.toLowerCase();

    return new Promise((resolve, reject) => {
        axios.get(`${currentUrl}/profile/${lowerCaseNickname}`, config).then(response => {
            return resolve(response);
        }).catch(err => {
            return reject(err);
        })
    })
}