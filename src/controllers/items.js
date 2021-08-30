'use strict'
// const { NotFound, BadRequest } = require('../errors/http')
const itemsService = require('../services/items')

async function getItems (req, res, next) {
  try {
    const items = await itemsService.getItems(req)

    // if (!items) {
    //   throw new NotFound()
    // }

    return res.json(items)
  } catch (err) {
    next(err)
  }
}

module.exports = { getItems }
