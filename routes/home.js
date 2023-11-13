const express = require('express')
const winston = require('winston')
const config = require('config')
const router = express.Router()

router.get('/', async (req, res) => {
    console.log(config.get('mail.host'))
    res.render('index', {title: 'My express app.', message: 'Hello world'})
})

module.exports = router
