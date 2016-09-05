/* eslint-env mocha*/
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';
import schema from './sculp-schema';

import { tryValidate, validate, ValidationError, Presence } from '../src/index';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('Basic validation tests with example schema', function () {

  it('empty value passes validation', function () {
    assert.isUndefined(validate(undefined, schema));
  });

  it('correct value passes validation', function () {
    const value = {
      firstname : 'John',
      lastname : 'Smith',
      agreedToTerms : true
    };

    const result = validate(value, schema);
    assert.deepEqual(result, {
      ...value,
      fullname : 'John Smith'
    });
  });

  it('should throw if not agreed to terms', function () {
    const value = {
      firstname : 'John',
      lastname : 'Smith',
      agreedToTerms : false
    };

    assert.throws(() => validate(value, schema), ValidationError);
  });

  it('mailing address should be absent if main address is empty', function () {
    const value = {
      firstname : 'John',
      lastname : 'Smith',
      mailingAddress : 'Moscow',
      agreedToTerms : true
    };

    const { result, fieldsState } = tryValidate(value, schema);

    assert.deepEqual(result, {
      firstname : 'John',
      lastname : 'Smith',
      fullname : 'John Smith',
      agreedToTerms : true
    });
    assert.equal(fieldsState['.mailingAddress'].$presence, Presence.ABSENT);
  });

  it('mailing address should be present if main address is defined', function () {
    const value = {
      firstname : 'John',
      lastname : 'Smith',
      fullname : 'John Smith',
      address : 'Moscow',
      mailingAddress : 'New York City',
      agreedToTerms : true
    };

    const { result, fieldsState } = tryValidate(value, schema);

    assert.deepEqual(result, {
      firstname : 'John',
      lastname : 'Smith',
      fullname : 'John Smith',
      address : 'Moscow',
      mailingAddress : 'New York City',
      agreedToTerms : true
    });
    assert.equal(fieldsState['.mailingAddress'].$presence, Presence.OPTIONAL);
  });

});
