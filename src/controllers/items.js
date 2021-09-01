'use strict'
const { BadRequest } = require('../errors/http')
const itemsService = require('../services/items')

async function getItems (req, res, next) {
  try {
    const { page, perPage } = req.query

    if ((page && isNaN(parseInt(page))) ||
    (perPage && isNaN(parseInt(perPage)))) {
      throw new BadRequest('page or perPage params are not numbers')
    }

    const items = await itemsService.getItems(req)

    // if (!items.data.length) {
    //   throw new NotFound()
    // }

    return res.json(items)
  } catch (err) {
    next(err)
  }
}

module.exports = { getItems }
