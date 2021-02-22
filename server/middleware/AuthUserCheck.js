const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const createCustomError = require('../helperFunctions/createCustomError');

const auth = async (req, res, next) => {
    try {
        if (req.headers.authentication === "guest") {
            const customError = createCustomError(401, "You have not been authorized to access this page!", [])
            return res.status(401).send(customError);
        }
        const token = req.headers.authentication;

        if (typeof token !== "string" || token[0] === "[") {
            const customError = createCustomError(401, "You have not been authorized to access this page!", [])
            return res.status(401).send(customError);
        } else {
            const decoded = await jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
            if (!user) {
                const customError = createCustomError(400, "No user found with that email!", [])
                return res.status(401).send(customError);
            }
            req.token = token;
            req.user = user;
            next();
        }
    } catch (err) {
        const customError = createCustomError(401, "You have not been authorized to access this page!", [])
        return res.status(401).send(customError);
    }
}

module.exports = auth;