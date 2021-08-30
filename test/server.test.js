/* global describe it  expect */
const supertest = require('supertest')
const server = require('../src/server')
const request = supertest(server)

describe('App server', () => {
  it('Should inherit from event emitter', done => {
    server.on('foo', done)
    server.emit('foo')
  })

  it('Should be callable', () => {
    expect(server).toBe.true
    expect(typeof server).toEqual('function')
  })

  it('Should 404 without routes', async () => {
    const response = await request.get('')

    expect(response.status).toBe(404)
  })
})
