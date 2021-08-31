class GeneralError extends Error {
  static STATUS_CODE = 500
  static DEFAULT_MESSAGE = 'Server Error'

  constructor (message) {
    super()
    this.message = (message && `${GeneralError.DEFAULT_MESSAGE} ${message}`) ||
      GeneralError.DEFAULT_MESSAGE
  }

  getCode () {
    if (this instanceof BadRequest) {
      return BadRequest.STATUS_CODE
    }
    if (this instanceof NotFound) {
      return NotFound.STATUS_CODE
    }
    return GeneralError.STATUS_CODE
  }
}

class BadRequest extends GeneralError {
  static STATUS_CODE = 400
  static DEFAULT_MESSAGE = 'Bad request'

  constructor (message) {
    super()
    this.message = (message && `${BadRequest.DEFAULT_MESSAGE} ${message}`) ||
    BadRequest.DEFAULT_MESSAGE
  }
}

class NotFound extends GeneralError {
  static STATUS_CODE = 404
  static DEFAULT_MESSAGE = 'Not Found'

  constructor (message) {
    super()
    this.message = (message && `${NotFound.DEFAULT_MESSAGE} ${message}`) ||
     NotFound.DEFAULT_MESSAGE
  }
}

module.exports = {
  GeneralError,
  BadRequest,
  NotFound
}
