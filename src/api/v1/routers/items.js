const express = require('express')
const {
  getItems
} = require('../../../controllers/items')

function itemsRouter () {
  const router = express.Router()

  // routes over /items
  router.get('/', getItems)

  return router
}

module.exports = itemsRouter
