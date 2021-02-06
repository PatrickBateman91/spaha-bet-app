const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Schema za pravljenje novih Usera
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid!')
            }
        }
    },
    nickname:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(value.length < 1){
                throw new Error('Nickname has to have at least 1 letter')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        validate(value){
            if(value.length < 6){
                throw new Error('Password must have at least 6 letters')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatarLocation:{
        type: String
    },
    groups:{
        type:Array,
        required:true
    },
    notifications:{
        type: Array,
        required:true
    },
    resetPasswordLink: {
        type: String
    }
}, {timestamps:true})


//Generisanje tokena
userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id:this._id.toString()}, process.env.JWT_SECRET);
    this.tokens = this.tokens.concat({token}) 
        await this.save();
        return token;
}

//Brisanje passworda,tokena, klastera i avatara
userSchema.methods.toJSON = function(){
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.tokens;
        return userObject;
}

//Nalaženje korisnika
userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({email});
    if(!user){
        throw new Error('User not found!')
    }

    const passCheck = await bcryptjs.compare(password, user.password);
    if(!passCheck){
        throw new Error('Wrong password')
    }
    return user;
}

//Enkripcija passworda
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcryptjs.hash(this.password, 8);
    }
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;