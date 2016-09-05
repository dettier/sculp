/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { validate, Type } from '../src/index';
const { STRING, STRING_NET, NUMBER, DATE, BOOLEAN, FUNCTION } = Type;

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

const options = { strict : true };

describe('casts:', function () {

  describe('STRING:', function () {

    const schema = { type : STRING };

    it('should validate string value', function () {
      assert.equal(validate('string ', schema, options), 'string ');
      // eslint-disable-next-line no-new-wrappers
      assert.equal(validate(new String('string'), schema, options), 'string');
    });

    it('should return error object if value is not a string', function () {
      assert.throws(() => validate(2, schema, options), 'сouldn\'t cast value to type STRING');
      assert.throws(() => validate(true, schema, options), 'сouldn\'t cast value to type STRING');
      assert.throws(() => validate({}, schema, options), 'сouldn\'t cast value to type STRING');
      assert.throws(() => validate([], schema, options), 'сouldn\'t cast value to type STRING');
    });

  });

  describe('STRING_NET:', function () {

    const schema = { type : STRING_NET };

    it('should return undefined is string is empty or whitespace-only', function () {
      assert.equal(validate('', schema, options), undefined);
      assert.equal(validate(' ', schema, options), undefined);
      assert.equal(validate('\t', schema, options), undefined);
    });

    it('should validate string value', function () {
      assert.equal(validate('string ', schema, options), 'string');
      // eslint-disable-next-line no-new-wrappers
      assert.equal(validate(new String(' string'), schema, options), 'string');
    });

    it('should return error object if value is not a string', function () {
      assert.throws(() => validate(2, schema, options),
        'сouldn\'t cast value to type STRING_NET');
      assert.throws(() => validate(true, schema, options),
        'сouldn\'t cast value to type STRING_NET');
      assert.throws(() => validate({}, schema, options),
        'сouldn\'t cast value to type STRING_NET');
      assert.throws(() => validate([], schema, options),
        'сouldn\'t cast value to type STRING_NET');
    });

  });


  describe('NUMBER:', function () {

    const schema = { type : NUMBER };

    it('should validate number value', function () {
      assert.equal(validate(4, schema, options), 4);
      // eslint-disable-next-line no-new-wrappers
      assert.equal(validate(new Number(12), schema, options), 12);
    });

    it('should return error object if value is not a number', function () {
      assert.throws(() => validate('2', schema, options),
        'сouldn\'t cast value to type NUMBER');
      assert.throws(() => validate(true, schema, options),
        'сouldn\'t cast value to type NUMBER');
      assert.throws(() => validate({}, schema, options),
        'сouldn\'t cast value to type NUMBER');
      assert.throws(() => validate([], schema, options),
        'сouldn\'t cast value to type NUMBER');
    });

  });


  describe('DATE:', function () {

    const schema = { type : DATE };

    it('should validate date value', function () {
      const date = new Date();
      assert.deepEqual(validate(date, schema, options), date);
    });

    it('should return error object if value is not a date', function () {
      assert.throws(() => validate('2', schema, options),
        'сouldn\'t cast value to type DATE');
      assert.throws(() => validate(2, schema, options),
        'сouldn\'t cast value to type DATE');
      assert.throws(() => validate(true, schema, options),
        'сouldn\'t cast value to type DATE');
      assert.throws(() => validate({}, schema, options),
        'сouldn\'t cast value to type DATE');
      assert.throws(() => validate([], schema, options),
        'сouldn\'t cast value to type DATE');
    });

  });


  describe('FUNCTION:', function () {

    const schema = { type : FUNCTION };

    it('should validate function value', function () {
      const f = function () {};
      assert.strictEqual(validate(f, schema, options), f);
    });

    it('should return error object if value is not a function', function () {
      assert.throws(() => validate('2', schema, options),
        'сouldn\'t cast value to type FUNCTION');
      assert.throws(() => validate(2, schema, options),
        'сouldn\'t cast value to type FUNCTION');
      assert.throws(() => validate(true, schema, options),
        'сouldn\'t cast value to type FUNCTION');
      assert.throws(() => validate({}, schema, options),
        'сouldn\'t cast value to type FUNCTION');
      assert.throws(() => validate([], schema, options),
        'сouldn\'t cast value to type FUNCTION');
    });

  });


  describe('BOOLEAN:', function () {

    const schema = { type : BOOLEAN };

    it('should validate boolean value', function () {
      assert.strictEqual(validate(true, schema, options), true);
      assert.strictEqual(validate(false, schema, options), false);
    });

    it('should return error object if value is not a boolean', function () {
      assert.throws(() => validate('2', schema, options),
        'сouldn\'t cast value to type BOOLEAN');
      assert.throws(() => validate(1, schema, options),
        'сouldn\'t cast value to type BOOLEAN');
      assert.throws(() => validate({}, schema, options),
        'сouldn\'t cast value to type BOOLEAN');
      assert.throws(() => validate([], schema, options),
        'сouldn\'t cast value to type BOOLEAN');
    });

  });

});
