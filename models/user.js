const Joi = require('joi')
const jwt = require('jsonwebtoken')
const config = require('config')
const mongoose = require('mongoose')
const mailSender = require('../utils/mailSender')
const winston = require('winston')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    termsAndServices: {
        type: Boolean,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    }
})

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id, name: this.name, email: this.email}, config.get('jwtPrivateKey'))
}

const User = new mongoose.model('User', userSchema)


function validateUser (user) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
        termsAndServices: Joi.boolean().valid(true).required(),
    })

    return schema.validate(user)
}

function validateEmail (email) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
    })

    return schema.validate(email)
}

async function sendVerificationEmail({ email, otp}) {
    try {
        const mailResponse = await mailSender(
          email,
          "Verification Email",
          `<h1>Please confirm your OTP</h1>
       <p>Here is your OTP code: ${otp}</p>`
        );

        winston.log("Email sent successfully: ", mailResponse);
    } catch (error) {
        winston.error(error.message)
    }
}

userSchema.pre("save", async function (next) {
    winston.info("New document saved to the database");
    if (this.isNew) {
        await sendVerificationEmail({ email: this.email, otp: this.otp});
    }
    next();
});

module.exports.validateEmail = validateEmail
module.exports.validate = validateUser
module.exports.User = User
