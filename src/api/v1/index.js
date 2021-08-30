const express = require('express')
const itemsRouter = require('./routers/items')

function apiV1Router () {
  const router = express.Router()

  router.use('/items', itemsRouter())

  return router
}

module.exports = apiV1Router
