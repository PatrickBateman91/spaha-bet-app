const createSendObject = (code, message, payload) => {
    return {
        code,
        message,
        payload
    }
}

module.exports = createSendObject;