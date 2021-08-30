/* global describe it  expect */
const supertest = require('supertest')
const querystring = require('querystring')

const server = require('../../src/server')
const request = supertest(server)

const itemsApiPath = '/api/v1/items'
const defaultPaginationQueryParams = {
  page: 1,
  perPage: 20
}

describe('Controllers/items', () => {
  it('Should get items correctly paginated', async () => {
    const response = await request.get(
      `${itemsApiPath}?${querystring.stringify(defaultPaginationQueryParams)}`
    )

    expect(response.status).toBe(200)
    expect(response.type).toEqual('application/json')

    const { data, metadata } = response.body

    expect(data.length).toBe(20)
    expect(data[0].absoluteIndex).toBe(0)
    expect(data[data.length - 1].absoluteIndex).toBe(19)

    expect(metadata.prevPageLink).toBe(undefined)
    expect(metadata.nextPageLink).toContain('page=2')
  })
})
