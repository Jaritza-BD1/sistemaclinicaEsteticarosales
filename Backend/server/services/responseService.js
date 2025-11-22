class ResponseService {
  /**
   * Flexible success responder.
   * Supports both call shapes used across the codebase:
   *  - success(res, message, data, statusCode)
   *  - success(res, data, message, statusCode)
   */
  static success(res, a = null, b = 'Success', c = 200) {
    let message = 'Success';
    let data = null;
    let statusCode = 200;

    if (typeof a === 'string') {
      // signature: (res, message, data?, statusCode?)
      message = a;
      data = b === 'Success' ? null : b;
      statusCode = typeof c === 'number' ? c : 200;
    } else {
      // signature: (res, data, message?, statusCode?)
      data = a;
      message = typeof b === 'string' ? b : 'Success';
      statusCode = typeof c === 'number' ? c : 200;
    }

    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Flexible error responder.
   * Accepts either:
   *  - error(res, message, statusCode, errors)
   *  - error(res, message, errors)
   * If the third argument is a number it is treated as statusCode, otherwise as errors.
   */
  static error(res, message = 'Error occurred', maybeStatusOrErrors = 400, maybeErrors = null) {
    let statusCode = 400;
    let errors = null;

    if (typeof maybeStatusOrErrors === 'number') {
      statusCode = maybeStatusOrErrors;
      errors = maybeErrors;
    } else {
      // caller passed errors as third arg (common in controllers)
      errors = maybeStatusOrErrors;
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  static validationError(res, errors) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      })),
      timestamp: new Date().toISOString()
    });
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static internalError(res, message = 'Internal server error') {
    return this.error(res, message, 500);
  }

  static paginated(res, data, page, limit, total) {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    });
  }

  // Convenience helpers used across controllers
  static created(res, a = null, b = null) {
    // created could be called as (res, data) or (res, message, data). Delegate to success with 201.
    return this.success(res, a, b, 201);
  }

  static badRequest(res, message = 'Bad Request', errors = null) {
    return this.error(res, message, 400, errors);
  }

  static conflict(res, message = 'Conflict', errors = null) {
    return this.error(res, message, 409, errors);
  }
}

module.exports = ResponseService; 