'use strict'
const axios = require('axios')

const DEFAULT_PER_PAGE_ITEMS = 100

let itemsCache

const calculateOffset = (page, perPageItems) => (page - 1) * perPageItems
const calculateLimit = (page, perPageItems) => page * perPageItems

const getOffsetLegacyPageNumber = (offset) =>
  parseInt(offset / DEFAULT_PER_PAGE_ITEMS) + 1

const getLimitLegacyPageNumber = (limit) =>
  parseInt(limit / DEFAULT_PER_PAGE_ITEMS) + 1

const getMetaData = (pageNumber, perPage, totalItems) => {
  const nextPage = pageNumber + 1
  const prevPage = pageNumber - 1
  const metadata = {
    totalItems,
    perPage,
    page: pageNumber,
    ...(pageNumber > 1 && { prevPageLink: `/api/v1/items?page=${prevPage}` }),
    nextPageLink: `/api/v1/items?page=${nextPage}`
  }
  return metadata
}

const getComputedItems = (data, offset, limit) => {
  if (
    data &&
    data.data
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
async function getItems ({
  page = 1,
  perPage = DEFAULT_PER_PAGE_ITEMS
} = {}) {
  try {
    const pageNumber = parseInt(page)
    const perPageNumber = parseInt(perPage)

    const offset = calculateOffset(pageNumber, perPageNumber)
    const limit = calculateLimit(pageNumber, perPageNumber)

    const legacyOffsetPageNumber = getOffsetLegacyPageNumber(offset)
    const legacyLimitPageNumber = getLimitLegacyPageNumber(limit)

    const legacyPaginationOffsetResponse = await axios.get(
      `https://sf-legacy-api.vercel.app/items?page=${legacyOffsetPageNumber}`
    )

    const { data } = legacyPaginationOffsetResponse

    const offsetItems = getComputedItems(data,
      offset,
      limit
    )

    let resultItems = offsetItems
    let metadata

    if (legacyLimitPageNumber !== legacyOffsetPageNumber) {
      const legacyLimitItemsOffset = 0
      const legacyLimitItemsLimit = limit % DEFAULT_PER_PAGE_ITEMS
      const legacyPaginationLimitResponse = await axios.get(
        `https://sf-legacy-api.vercel.app/items?page=${legacyLimitPageNumber}`
      )
      const limitItems = getComputedItems(
        legacyPaginationLimitResponse.data,
        legacyLimitItemsOffset,
        legacyLimitItemsLimit
      )

      resultItems = [...resultItems, limitItems]
    }

    if (
      data.metadata
    ) {
      const { metadata: originMetadata } = data
      metadata =
        getMetaData(pageNumber, perPage, originMetadata.totalItems)
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
