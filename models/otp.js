const mongoose = require('mongoose');
const Joi = require('joi')
const mailSender = require('../utils/mailSender')
const winston = require('winston')

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
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
}, { timestamps: true});

const OTP = mongoose.model("OTP", otpSchema);

function validateOtp (otp) {
  const schema = Joi.object({
    otp: Joi.string().regex(/^[0-9]{5}$/).messages({'string.pattern.base': `OTP must have 5 digits.`}).required()
  })
  return schema.validate(otp)
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

otpSchema.pre("save", async function (next) {
  winston.info("New document saved to the database");
  if (this.isNew) {
    await sendVerificationEmail({ email: this.email, otp: this.otp});
  }
  next();
});

module.exports.validate = validateOtp
module.exports.OTP = OTP
