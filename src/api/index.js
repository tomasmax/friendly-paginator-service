const express = require('express')

function apiRouter () {
  const router = express.Router()
  const apiV1Router = require('./v1')

  router.use('/v1', apiV1Router())

  return router
}

module.exports = apiRouter
