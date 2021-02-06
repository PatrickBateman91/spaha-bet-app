const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const auth = async (req, res, next) => {
    try{
        if(req.headers.authentication === "guest"){
            return res.status(401).send("You have not been authorized to access this page!");   
        }
        const token = req.headers.authentication;

        if(typeof token !== "string" || token[0] === "["){
            return res.status(401).send("You have not been authorized to access this page!"); 
        } else{
            const decoded = await jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
            if(!user){
                throw new Error('No user found with that email!');
            }
            req.token = token;
            req.user = user;
            next();
        }
    } catch(err){
        console.log(err);
        res.status(401).send("You have not been authorized to access this page!");
    }
}

module.exports = auth;