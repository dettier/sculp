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

  describe('hasGet', function () {

    it('hasGetValue возвращает объект с полями has и value', function () {
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

    it('должен создавать объект при устрановке в undefined значение', function () {
      let result;
      result = setValue(undefined, '.props.a', 5);
      assert.deepEqual(result, { props : { a : 5 } });

      result = setValue(undefined, '.props.a', undefined, false);
      assert.deepEqual(result, { props : { a : undefined } });

      result = setValue(undefined, '.props.a', undefined, true);
      assert.isUndefined(result);

      result = setValue({}, '.props.a', undefined, true);
      assert.deepEqual(result, {});
    });

  });

  describe('get', function () {

    it('должен вытаскивать из объекта', function () {
      const object = {
        contacts : {
          phones : [ '911' ]
        }
      };
      const result = getValue(object, '.contacts.phones[0]');
      assert.deepEqual(result, '911');
    });

    it('должен вытаскивать из массива', function () {
      const value = [
        { path: 'a', photosCount: 2 },
        { path: 'b', photosCount: 2 }
      ];
      const result = getValue(value, '[0].path');
      assert.deepEqual(result, 'a');
    });

  });

});
