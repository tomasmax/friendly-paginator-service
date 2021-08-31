'use strict'
const axios = require('axios')
const {
  setCache,
  isLegacyPageInCache,
  getCache
} = require('../cache/inMemory')

const DEFAULT_PER_PAGE_ITEMS = 100
const LEGACY_PAGINATION_URL = 'https://sf-legacy-api.vercel.app/items'
const OFFSET_LEGACY_PAGE_CACHE_KEY = 'offset'
const LIMIT_LEGACY_PAGE_CACHE_KEY = 'limit'

const calculateOffset = (page, perPageItems) => (page - 1) * perPageItems
const calculateLimit = (page, perPageItems) => page * perPageItems

const getOffsetLegacyPageNumber = (offset) =>
  parseInt(offset / DEFAULT_PER_PAGE_ITEMS) + 1

const getLimitLegacyPageNumber = (limit) =>
  parseInt((limit - 1) / DEFAULT_PER_PAGE_ITEMS) + 1

const getRequestUrl = (req) => `${req.protocol}://${req.hostname}${req.baseUrl}`

const getMetaData = (pageNumber, perPage, totalItems, requestUrl) => {
  const nextPage = pageNumber + 1
  const prevPage = pageNumber - 1
  const metadata = {
    totalItems,
    perPage,
    page: pageNumber,
    ...(pageNumber > 1 &&
      { prevPageLink: `${requestUrl}?page=${prevPage}&perPage=${perPage}` }),
    ...(calculateLimit(pageNumber, perPage) < totalItems &&
      { nextPageLink: `${requestUrl}?page=${nextPage}&perPage=${perPage}` })
  }
  return metadata
}

const getComputedItems = (items = [], offset, limit) => {
  const computedItems = items.slice(offset, limit)
  return computedItems
}

const getLegacyPaginationItemsPromise = async (cachekey, legacyPageNumber) =>
  isLegacyPageInCache(cachekey, legacyPageNumber)
    ? getCache(cachekey)
    : axios.get(`${LEGACY_PAGINATION_URL}?page=${legacyPageNumber}`)

/**
 *
 * @param {number} page - page number
 * @param {number} perPage - items per page
 */
async function getItems (req) {
  try {
    const { page = 1, perPage = DEFAULT_PER_PAGE_ITEMS } = req.query

    const pageNumber = parseInt(page)
    const perPageNumber = parseInt(perPage)

    const offset = calculateOffset(pageNumber, perPageNumber)
    const limit = calculateLimit(pageNumber, perPageNumber)

    const legacyOffsetPageNumber = getOffsetLegacyPageNumber(offset)
    const legacyLimitPageNumber = getLimitLegacyPageNumber(limit)

    const isLimitInOtherPage = legacyLimitPageNumber !== legacyOffsetPageNumber

    const [legacyPaginationOffsetResponse, legacyPaginationLimitResponse] =
    await Promise.all([getLegacyPaginationItemsPromise(
      OFFSET_LEGACY_PAGE_CACHE_KEY,
      legacyOffsetPageNumber
    ),
    isLimitInOtherPage
      ? getLegacyPaginationItemsPromise(
        LIMIT_LEGACY_PAGE_CACHE_KEY,
        legacyLimitPageNumber
      )
      : null])

    const { data } = legacyPaginationOffsetResponse
    let resultItems = []

    if (legacyPaginationOffsetResponse) {
      const { data: originItems = [] } = data

      resultItems = getComputedItems(originItems,
        offset % DEFAULT_PER_PAGE_ITEMS,
        isLimitInOtherPage ? originItems.length : limit
      )

      setCache(OFFSET_LEGACY_PAGE_CACHE_KEY, {
        data: originItems,
        legacyPageNumber:
        legacyOffsetPageNumber
      })
    }

    // In case limit item page is different from the offset one
    if (legacyPaginationLimitResponse) {
      const limitMod = limit % DEFAULT_PER_PAGE_ITEMS
      const limitPageItemsLimit =
        limitMod === 0 ? DEFAULT_PER_PAGE_ITEMS : limitMod

      const { data: originLimitPageItems } =
        legacyPaginationLimitResponse.data

      const limitItems = getComputedItems(
        originLimitPageItems,
        0,
        limitPageItemsLimit
      )

      setCache(LIMIT_LEGACY_PAGE_CACHE_KEY, {
        data: originLimitPageItems,
        legacyPageNumber: legacyLimitPageNumber
      })

      resultItems = [...resultItems, ...limitItems]
    }

    let metadata

    if (
      data.metadata
    ) {
      const { metadata: originMetadata } = data
      metadata =
        getMetaData(pageNumber,
          perPage,
          originMetadata.totalItems,
          getRequestUrl(req)
        )
      setCache(OFFSET_LEGACY_PAGE_CACHE_KEY, { metadata })
    }

    const response = {
      metadata,
      data: resultItems
    }

    return response
  } catch (err) {
    console.error('[service/items]:Error getting items:',
      err.message,
      err.stack
    )
    throw new Error('[service/items]:Error getting items:', err.message)
  }
}

module.exports = {
  getItems
}
