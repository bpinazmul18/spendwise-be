const nodemailer = require('nodemailer');
const winston = require('winston')
const config = require('config')

const mailSender = async (email, title, body) => {
  try {
    // Create a Transporter to send emails
    let transporter = nodemailer.createTransport({
      host: config.get('mail.host'),
      auth: {
        user: config.get('mail.user'),
        pass: config.get('mail.password')
      }
    });

    // Send emails to users
    let info = await transporter.sendMail({
      from: 'my@gmail.com',
      to: email,
      subject: title,
      html: body,
    });

    winston.info("Email info: ", info);
    return info;
  } catch (error) {
    winston.error(error.message)
  }
};
module.exports = mailSender;