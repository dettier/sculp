/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { validate, Type, Presence } from '../src/index';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('Validation rules:', function () {

  it('should validate $values rule', function () {
    const schema = {
      type : Type.NUMBER,
      $values : [ -1, 0, 1 ]
    };
    assert.doesNotThrow(() => validate(0, schema));
    assert.doesNotThrow(() => validate('-1', schema));
    assert.throws(() => validate(2, schema), 'invalid value');
  });

  it('should validate $regexp rule', function () {
    const schema = {
      type : Type.STRING,
      $regexp : '^\\d\\d\\d$'
    };
    assert.doesNotThrow(() => validate(100, schema));
    assert.doesNotThrow(() => validate('999', schema));
    assert.throws(() => validate('99', schema), 'invalid value');
    assert.throws(() => validate('w999', schema), 'invalid value');
    assert.throws(() => validate('1999', schema), 'invalid value');
  });

  it('should validate $lengthmin rule', function () {
    const schema = {
      type : Type.STRING,
      $lengthmin : 5
    };
    assert.doesNotThrow(() => validate('01570', schema));
    assert.doesNotThrow(() => validate('string', schema));
    assert.throws(() => validate('nope', schema), 'length must be at least 5');
  });

  it('should validate $lengthmax rule', function () {
    const schema = {
      type : Type.STRING,
      $lengthmax : 4
    };
    assert.doesNotThrow(() => validate('cool', schema));
    assert.throws(() => validate('sculp', schema), 'length must be less than or equal to 4');
  });

  it('should validate $length rule', function () {
    const schema = {
      type : Type.STRING,
      $length : 4
    };
    assert.doesNotThrow(() => validate('cool', schema));
    assert.throws(() => validate('sculp', schema), 'length must be exactly 4');
  });

  it('should validate $ne rule', function () {
    const schema = {
      type : Type.STRING,
      $ne : 'sculp'
    };
    assert.doesNotThrow(() => validate('cool', schema));
    assert.throws(() => validate('sculp', schema), 'value must be not equal to sculp');
  });

  it('should validate $min rule', function () {
    const schema = {
      type : Type.NUMBER,
      $min : 0
    };
    assert.doesNotThrow(() => validate(0, schema));
    assert.doesNotThrow(() => validate(1, schema));
    assert.throws(() => validate(-1, schema), 'value must be at least 0');
  });

  it('should validate $max rule', function () {
    const schema = {
      type : Type.NUMBER,
      $max : 0
    };
    assert.doesNotThrow(() => validate(0, schema));
    assert.doesNotThrow(() => validate(-1, schema));
    assert.throws(() => validate(1, schema), 'value must be less than or equal to 0');
  });

  it('should validate $gt rule', function () {
    const schema = {
      type : Type.NUMBER,
      $gt : 0
    };
    assert.doesNotThrow(() => validate(1, schema));
    assert.throws(() => validate(0, schema), 'value must be greater than 0');
    assert.throws(() => validate(-1, schema), 'value must be greater than 0');
  });

  it('should validate $lt rule', function () {
    const schema = {
      type : Type.NUMBER,
      $lt : 0
    };
    assert.doesNotThrow(() => validate(-1, schema));
    assert.throws(() => validate(0, schema), 'value must be less than 0');
    assert.throws(() => validate(1, schema), 'value must be less than 0');
  });

  it('should validate $presence rule (REQUIRED)', function () {
    const schema = {
      type : Type.NUMBER,
      $presence : Presence.REQUIRED
    };
    assert.doesNotThrow(() => validate(-1, schema));
    assert.throws(() => validate(undefined, schema), 'value is required');
  });

  it('should validate $presence rule (ABSENT): should remove value and not throw',
  function () {
    const schema = {
      type : Type.NUMBER,
      $presence : Presence.ABSENT
    };
    assert.doesNotThrow(() => validate(undefined, schema));
    assert.deepEqual(validate(1, schema), undefined);
  });

});
