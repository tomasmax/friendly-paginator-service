'use strict'
const { GeneralError } = require('../errors/http')

const errorHandler = (err, req, res, next) => {
  const { message } = err
  const status = 'Error'

  if (err instanceof GeneralError) {
    const statusCode = err.getCode()
    return res.status(statusCode).json({
      status,
      statusCode,
      message
    })
  }

  return res.status(GeneralError.STATUS_CODE).json({
    status,
    statusCode: GeneralError.STATUS_CODE,
    message
  })
}

module.exports = errorHandler
