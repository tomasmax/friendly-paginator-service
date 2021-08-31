/* global describe it  expect beforeAll beforeEach afterAll */
const supertest = require('supertest')
const querystring = require('querystring')
const { performance } = require('perf_hooks')

const { clearCache } = require('../../src/cache/inMemory')
const server = require('../../src/server')
const request = supertest(server)

const itemsApiPath = '/api/v1/items'

beforeAll(async () => clearCache())
afterAll(async () => clearCache())

describe('Controllers/items', () => {
  it('Should get items correctly paginated for {page: 1, perPage: 20}', async () => {
    const queryParams = {
      page: 1,
      perPage: 20
    }

    const response = await request.get(
      `${itemsApiPath}?${querystring.stringify(queryParams)}`
    )

    expect(response.status).toBe(200)
    expect(response.type).toEqual('application/json')

    const { data, metadata } = response.body

    expect(data.length).toBe(queryParams.perPage)
    expect(data[0].absoluteIndex).toBe(0)
    expect(data[data.length - 1].absoluteIndex).toBe(19)

    expect(metadata.prevPageLink).toBe(undefined)
    expect(metadata.nextPageLink).toContain('page=2&perPage=20')
  })

  it('Should get items correctly paginated for {page: 2, perPage: 30}', async () => {
    const queryParams = {
      page: 2,
      perPage: 30
    }

    const response = await request.get(
      `${itemsApiPath}?${querystring.stringify(queryParams)}`
    )

    expect(response.status).toBe(200)
    expect(response.type).toEqual('application/json')

    const { data, metadata } = response.body

    expect(data.length).toBe(queryParams.perPage)
    expect(data[0].absoluteIndex).toBe(30)
    expect(data[data.length - 1].absoluteIndex).toBe(59)

    expect(metadata.prevPageLink).toContain('page=1&perPage=30')
    expect(metadata.nextPageLink).toContain('page=3&perPage=30')
  })

  it('Should get items correctly paginated for different offset and limit legacy page numbers {page: 3, perPage: 40}', async () => {
    const queryParams = {
      page: 3,
      perPage: 40
    }

    const response = await request.get(
      `${itemsApiPath}?${querystring.stringify(queryParams)}`
    )

    expect(response.status).toBe(200)
    expect(response.type).toEqual('application/json')

    const { data, metadata } = response.body

    expect(data.length).toBe(queryParams.perPage)
    expect(data[0].absoluteIndex).toBe(80)
    expect(data[data.length - 1].absoluteIndex).toBe(119)

    expect(metadata.prevPageLink).toContain('page=2&perPage=40')
    expect(metadata.nextPageLink).toContain('page=4&perPage=40')
  })

  it('Should not return metadata.nextPageLink for last page and return {page: 10, perPage: 100}', async () => {
    const queryParams = {
      page: 10000,
      perPage: 100
    }

    const response = await request.get(
      `${itemsApiPath}?${querystring.stringify(queryParams)}`
    )

    expect(response.status).toBe(200)
    expect(response.type).toEqual('application/json')

    const { data, metadata } = response.body

    expect(data.length).toBe(queryParams.perPage)
    expect(data[0].absoluteIndex).toBe(999900)
    expect(data[data.length - 1].absoluteIndex).toBe(999999)

    expect(metadata.prevPageLink).toContain('page=9999&perPage=100')
  })

  it('Should get items correctly paginated and check cache improves performance', async () => {
    clearCache()
    const queryParams = {
      page: 4,
      perPage: 190
    }

    let t0 = performance.now()
    const response1 = await request.get(
      `${itemsApiPath}?${querystring.stringify(queryParams)}`
    )
    let t1 = performance.now()
    expect(response1.status).toBe(200)
    const performance1 = t1 - t0
    console.log('Execution time no cache: ', performance1)

    t0 = performance.now()
    const cachedResponse = await request.get(
      `${itemsApiPath}?${querystring.stringify(queryParams)}`
    )
    t1 = performance.now()
    expect(cachedResponse.status).toBe(200)
    const cachedPerformance = t1 - t0
    console.log('Execution time cached request: ', cachedPerformance)

    expect(cachedPerformance).toBeLessThanOrEqual(performance1)
  })

  it('Should throw a 400 if page or perPage queryParams are not numbers', async () => {
    const queryParams = {
      page: 'NaN',
      perPage: 'NaN'
    }

    const response = await request.get(
      `${itemsApiPath}?${querystring.stringify(queryParams)}`
    )

    expect(response.status).toBe(400)
  })
})
