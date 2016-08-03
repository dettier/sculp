/* eslint-env mocha*/
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import chai from 'chai';
const assert = chai.assert;

import {
  getValue,
  setValue,
  hasGetValue
} from '../../lib/object/helper';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////


describe('object-helper:', function () {

  describe('hasGetValue:', function () {

    it('should return object with has and get fields', function () {
      let result;
      result = hasGetValue({ a : 1 }, '.a');
      assert.deepEqual(result, { has : true, value : 1 });

      result = hasGetValue({ a : 1 }, '.b');
      assert.deepEqual(result, { has : false });

      result = hasGetValue({ a : 1 }, '');
      assert.deepEqual(result, { has : true, value : { a : 1 } });

      result = hasGetValue({ props: { b : 'b' } }, '.props.b');
      assert.deepEqual(result, { has : true, value : 'b' });
    });

  });

  describe('set', function () {

    it('should create intermediate objects and arrays', function () {
      let result;
      result = setValue(undefined, '.props.a', 5);
      assert.deepEqual(result, { props : { a : 5 } });

      result = setValue(undefined, '.props.a', undefined, false);
      assert.deepEqual(result, { props : { a : undefined } });

      result = setValue(undefined, '[1].a', undefined, false);
      assert.deepEqual(result, [ , { a : undefined } ]); // eslint-disable-line no-sparse-arrays

      result = setValue(undefined, '.props.a', undefined, true);
      assert.isUndefined(result);

      result = setValue({}, '.props.a', undefined, true);
      assert.deepEqual(result, {});
    });

  });

  describe('get', function () {

    it('should get value from object', function () {
      const object = {
        contacts : {
          phones : [ '911' ]
        }
      };
      const result = getValue(object, '.contacts.phones[0]');
      assert.deepEqual(result, '911');
    });

    it('should get value from array', function () {
      const value = [
        { path: 'a', photosCount: 2 },
        { path: 'b', photosCount: 2 }
      ];
      const result = getValue(value, '[0].path');
      assert.deepEqual(result, 'a');
    });

  });

});
