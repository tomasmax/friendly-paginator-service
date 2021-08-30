'use strict'
const axios = require('axios')

const DEFAULT_PER_PAGE_ITEMS = 100
const LEGACY_PAGINATION_URL = 'https://sf-legacy-api.vercel.app/items'

const calculateOffset = (page, perPageItems) => (page - 1) * perPageItems
const calculateLimit = (page, perPageItems) => page * perPageItems

const getOffsetLegacyPageNumber = (offset) =>
  parseInt(offset / DEFAULT_PER_PAGE_ITEMS) + 1

const getLimitLegacyPageNumber = (limit) =>
  parseInt((limit - 1) / DEFAULT_PER_PAGE_ITEMS) + 1

const getRequestUrl = (req) => `${req.protocol}://${req.host}${req.baseUrl}`

const getMetaData = (pageNumber, perPage, totalItems, requestUrl) => {
  const nextPage = pageNumber + 1
  const prevPage = pageNumber - 1
  const metadata = {
    totalItems,
    perPage,
    page: pageNumber,
    ...(pageNumber > 1 &&
      { prevPageLink: `${requestUrl}?page=${prevPage}&perPage=${perPage}` }),
    nextPageLink: `${requestUrl}?page=${nextPage}&perPage=${perPage}`
  }
  return metadata
}

const getComputedItems = (data, offset, limit) => {
  if (
    data?.data
  ) {
    const { data: originalItemsData } = data
    const computedItems = originalItemsData.slice(offset, limit)
    return computedItems
  }
}

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
    await Promise.all([axios.get(
      `${LEGACY_PAGINATION_URL}?page=${legacyOffsetPageNumber}`
    ), isLimitInOtherPage
      ? await axios.get(
      `${LEGACY_PAGINATION_URL}?page=${legacyLimitPageNumber}`
      )
      : null])

    const { data } = legacyPaginationOffsetResponse

    let resultItems = getComputedItems(data,
      offset % DEFAULT_PER_PAGE_ITEMS,
      isLimitInOtherPage ? data.data?.length : limit
    )

    if (legacyPaginationLimitResponse) {
      const limitMod = limit % DEFAULT_PER_PAGE_ITEMS
      const legacyLimitItemsOffset = 0
      const legacyLimitItemsLimit =
        limitMod === 0 ? DEFAULT_PER_PAGE_ITEMS : limitMod

      const limitItems = getComputedItems(
        legacyPaginationLimitResponse.data,
        legacyLimitItemsOffset,
        legacyLimitItemsLimit
      )

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
    }

    const response = {
      metadata,
      data: resultItems
    }

    return response
  } catch (err) {
    console.error('[service/items]Error getting items:', err.message)
    throw new Error('[service/items]Error getting items:', err.message)
  }
}

module.exports = {
  getItems
}
