const createCustomError = (code, message, payload) => {
    return {
        code,
        message,
        payload
    }
}

module.exports = createCustomError;