const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const winston = require('winston')

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
  },
});
// Define a function to send emails
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

otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendVerificationEmail({ email: this.email, otp: this.otp});
  }
  next();
});
module.exports = mongoose.model("OTP", otpSchema);