class ApiError extends Error{
    constructor(statusCode, message, isOperational = true, stack = '',errors) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
          this.stack = stack;
        } else {
          Error.captureStackTrace(this, this.constructor);
        }
        if(errors){
            this.errors = errors;
        }
    }

    static NotFound(name) {
        this.status = 404;
        this.message = `${name} Not Found`
    }

    static BadRequest(message = 'Bad Request, Check your inputs') {
        this.status = 400;
        this.message = message;
    }

    static UnprocessableEntity(message) {
        this.status = 422;
        this.message = message;
    }

    static Forbidden(message) {
        this.status = 403;
        this.message = message;
    }
}

module.exports = ApiError;