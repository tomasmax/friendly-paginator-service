/* global describe it  expect */
const supertest = require('supertest')
const querystring = require('querystring')

const server = require('../../src/server')
const request = supertest(server)

const itemsApiPath = '/api/v1/items'

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
})
