const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                const err = new Error('Email is invalid!')
                err.message = 'Email is invalid!';
                throw err;
            }
        }
    },
    nickname: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (value.length < 1) {
                const err = new Error('Nickname has to have at least 1 letter')
                err.message = 'Nickname has to have at least 1 letter';
                throw err;
            }
            else if (value.length > 16) {
                const err = new Error('Nickname has to be shorter')
                err.message = 'Nickname has to be shorter';
                throw err;
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length < 6) {
                const err = new Error('Password must have at least 6 letters')
                err.message = 'Password must have at least 6 letters';
                throw err;
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatarLocation: {
        type: String
    },
    groups: {
        type: Array,
        required: true
    },
    notifications: {
        type: Array,
        required: true
    },
    resetPasswordLink: {
        type: String
    }
}, { timestamps: true })


//Generisanje tokena
userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);
    this.tokens = this.tokens.concat({ token })
    await this.save();
    return token;
}

//Brisanje passworda,tokena, klastera i avatara
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}

//Nalaženje korisnika
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found!')
    }

    const passCheck = await bcryptjs.compare(password, user.password);
    if (!passCheck) {
        throw new Error('Wrong password')
    }
    return user;
}

//Enkripcija passworda
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcryptjs.hash(this.password, 8);
    }
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;