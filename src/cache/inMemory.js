'use strict'

let cache = {}

const setCache = (cacheKey, { data, metadata, legacyPageNumber }) => {
  if (cacheKey) {
    cache[cacheKey] = {
      data: {
        ...cache[cacheKey]?.data,
        ...(data && { data }),
        ...(metadata && { metadata }),
        ...(legacyPageNumber && { legacyPageNumber })
      }
    }
    console.log('[cache/inMemory]:setCache for key', cacheKey)
  }
}

const getCache = (cacheKey) => cache[cacheKey]

const isLegacyPageInCache = (cacheKey, legacyPage) => {
  const cacheValue = cache[cacheKey]
  if (!cacheValue) return false
  return Boolean(
    cacheValue.data?.legacyPageNumber === legacyPage &&
    cacheValue.data?.data?.length
  )
}

const clearCache = () => {
  cache = {}
}

module.exports = {
  setCache,
  getCache,
  isLegacyPageInCache,
  clearCache
}
