////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { getValidationErrorMessages } from './error-presenter';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

class ValidationError extends Error {

  constructor (errors = []) {
    super();
    // защитимся от случая когда забываем написать new
    if (this instanceof ValidationError === false) {
      // eslint-disable-next-line prefer-rest-params
      return new ValidationError(...arguments);
    }

    this.errors = errors;
    this.name = this.constructor.name;
    this.message = getValidationErrorMessages(this.errors)[0];

    // eslint-disable-next-line no-caller, prefer-rest-params
    //const ssf = arguments.callee;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    } else {
      this.stack = (new Error()).stack;
    }

    return this;
  }

}

////////////////////////////////////////////////////////////////////////////////
// ValidationError
////////////////////////////////////////////////////////////////////////////////

export default ValidationError;
