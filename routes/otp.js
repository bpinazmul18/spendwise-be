const express = require('express')
const router = express.Router()

const {validate, OTP } = require('../models/otp');
const { User } = require('../models/user')
const _ = require('lodash')

router.post('/verify-email', async (req, res) => {
  const {error, value} = validate(req.body)
  if (error) return res.status(400).send(error['details'][0].message)

  let otpData = await OTP.findOne({ otp: value['otp']})

  if (!otpData) {
    return res.status(400).send('OTP not matches!')
  }

  let user = await User.findOneAndUpdate({ email: otpData['email'] }, { verified: true })
  await user.save()
  await OTP.findOneAndDelete({ userId: user._id})

  const result = _.pick(user, ['_id', 'name', 'email'])
  return res.status(200).send(result)
})

module.exports = router

