const express = require('express')
const cors = require('cors')
const apiRoutes = require('./api')

const server = express()
// require('dotenv').config()

server.use(cors())

server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.use('/api', apiRoutes())

module.exports = server
