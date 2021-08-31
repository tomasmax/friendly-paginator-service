'use strict'

const express = require('express')
const cors = require('cors')
const apiRoutes = require('./api')
const errorHandler = require('./middlewares/errorHandler')

const server = express()
// require('dotenv').config()

server.use(cors())

server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.use('/api', apiRoutes())

server.use(errorHandler)

module.exports = server
