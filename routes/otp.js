const express = require('express')
const router = express.Router()

const otpGenerator = require('otp-generator');
const OTP = require('../models/otp');
const { User, validateEmail } = require('../models/user')

router.post('/send-otp', async (req, res) => {
  const {error, value} = validateEmail(req.body)

  if (error) return res.status(400).send(error['details'][0].message)

  // Check if user is already present
  let user = await User.findOne({ email: value['email']})
  if (user) return res.status(400).send('User already registered.')

  // Generate otp
  let otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  let result = await OTP.findOne({ otp: otp });

  while (result) {
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
    });

    result = await OTP.findOne({ otp: otp });
  }
  const otpPayload = { email: value['email'], otp };

  const otpBody = await OTP.create(otpPayload);

  return res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    otp,
  });
})

module.exports = router

