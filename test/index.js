/* eslint-env mocha*/
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import chai from 'chai';
const assert = chai.assert;

import { validateSync } from '../lib/index';
import { TYPE, PRESENCE } from '../lib/enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////


describe('Sculp:', function () {

  describe('validate:', function () {

    it('should validate primitive values', function () {
      let scheme;
      let result;

      scheme = { type : TYPE.STRING };
      result = validateSync('aaabbbccc', scheme);
      assert.equal(result, 'aaabbbccc');

      scheme = { type : TYPE.NUMBER, precision : 2 };
      result = validateSync('7.4444444', scheme);
      assert.equal(result, 7.44);

      scheme = { type : TYPE.BOOLEAN };
      result = validateSync('true', scheme);
      assert.equal(result, true);
    });

    it('should validate array', function () {
      const scheme = {
        type : TYPE.ARRAY,
        items : { type : TYPE.NUMBER }
      };
      const result = validateSync(['3', 4, '5'], scheme);
      assert.deepEqual(result, [ 3, 4, 5 ]);
    });

    it('should throw error when couldn\'t validate array', function () {
      const scheme = {
        type : TYPE.ARRAY,
        items : { type : TYPE.NUMBER }
      };

      assert.throws(function () {
        validateSync({ a : '2' }, scheme);
      }, 'Ошибка валидации поля');
    });

    it('should validate object', function () {
      const scheme = {
        type : TYPE.OBJECT,
        properties : {
          key1 : { type : TYPE.NUMBER },
          key2 : { type : TYPE.STRING }
        }
      };
      const result = validateSync({ key1 : '-1', key2 : 'a' }, scheme);
      assert.deepEqual(result, { key1 : -1, key2 : 'a' });
    });

    it('should validate group', function () {
      const scheme = {
        type : TYPE.GROUP,
        properties : {
          key1 : { type : TYPE.NUMBER },
          key2 : { type : TYPE.STRING }
        }
      };
      const result = validateSync({ key1 : '-1', key2 : 'a' }, scheme);
      assert.deepEqual(result, { key1 : -1, key2 : 'a' });

      const result2 = validateSync({}, scheme);
      assert.deepEqual(result2, {});
    });

  });

  describe('validate: validating array items', function () {

    it('should throw error when items are of wrong type', function () {
      const scheme = {
        type : TYPE.ARRAY,
        items : {
          type : TYPE.NUMBER
        }
      };
      assert.throws(function () {
        validateSync([ {} ], scheme);
      }, 'Не удалось привести значение к требуемому типу');
      assert.throws(function () {
        validateSync([ [] ], scheme);
      }, 'Не удалось привести значение к требуемому типу');
    });

  });


  describe('validate: failed validations & valid values', function () {

    it('should change value to valid for primitive values', function () {
      const scheme = {
        type : TYPE.OBJECT,
        properties : {
          key : {
            type : TYPE.NUMBER,
            $gt : 5,
            valid : 10
          }
        }
      };
      const result = validateSync({ key : 3 }, scheme);
      assert.deepEqual(result, { key : 10 });
    });

    it('should change value to valid for objects if subfield validation failed', function () {
      const scheme = {
        type : TYPE.OBJECT,
        valid : undefined,
        properties : {
          key : {
            type : TYPE.NUMBER,
            $gt : 5
          }
        }
      };
      const result = validateSync({ key : 3 }, scheme);
      assert.deepEqual(result, undefined);
    });

  });

  it('undefined value should remain undefined', function () {
    const scheme = {
      type : TYPE.OBJECT,
      properties : {
        key : {
          type : TYPE.NUMBER
        }
      }
    };
    const result = validateSync(undefined, scheme);
    assert.deepEqual(result, undefined);
  });

  describe('validate: calculating computes', function () {

    it('should not calculate computes for undefined parent value', function () {

      const scheme = {
        type : TYPE.OBJECT,
        properties : {
          key : {
            type : TYPE.NUMBER,
            compute : () => 9
          }
        }
      };
      const result = validateSync(undefined, scheme);
      assert.deepEqual(result, undefined);

    });

  });

  it('failed validation for absent fields does not matter', function () {

    const scheme = {
      type : TYPE.OBJECT,
      properties : {
        a : { type : TYPE.NUMBER },
        b : {
          type : TYPE.OBJECT,
          properties : {
            c : {
              type : TYPE.NUMBER,
              $gt : 10
            }
          }
        }
      }
    };

    const value = { a : 5, b : { c : 1 } };

    // this should fail as "c" value < 10
    assert.throws(() =>
      validateSync(value, scheme));

    scheme.properties.b.$presence = PRESENCE.ABSENT;
    const result = validateSync(value, scheme);
    assert.deepEqual(result, { a : 5 });
  });

  describe('valid values', function () {

    it('valid values: should change failed field value to valid', function () {
      const scheme = {
        type: TYPE.OBJECT,
        valid : { a: '1' },
        $presence: PRESENCE.REQUIRED,
        removeEmpty : true,
        properties: {
          a: { type : TYPE.STRING },
          b: { type : TYPE.STRING }
        }
      };

      const value = { c : 'a' };
      const result = validateSync(value, scheme);
      assert.deepEqual(result, { a : '1' });
    });

    it('valid value should also be validated', function () {
      const scheme = {
        type: TYPE.OBJECT,
        valid : { a: 1, b : 2 },
        $presence: PRESENCE.REQUIRED,
        removeEmpty : true,
        properties: {
          a: { type : TYPE.STRING },
          b: { type : TYPE.STRING }
        }
      };

      const value = { c : 'a' };
      const result = validateSync(value, scheme);
      assert.deepEqual(result, { a: '1', b : '2' });
    });

  });

  it('should remove initial item values if such option provided', function () {
    const scheme = {
      type: TYPE.OBJECT,
      properties: {
        a : {
          type : TYPE.NUMBER,
          removeInitial : true,
          initial : 1
        },
        b : {
          type : TYPE.NUMBER
        }
      }
    };

    const value = { a : 1, b : 2 };
    const result = validateSync(value, scheme, { removeInitial : true });
    assert.deepEqual(result, { b : 2 });
  });

  it('undefined array items are removed from array', function () {
    const scheme = {
      type: TYPE.ARRAY,
      $presence: PRESENCE.REQUIRED,
      items: {
        type : TYPE.NUMBER,
        $presence : PRESENCE.REQUIRED
      }
    };

    const value = [ 1, undefined, 2];
    const result = validateSync(value, scheme);
    assert.deepEqual(result, [ 1, 2 ]);
  });

  it('changing array item to undefined removes it from array', function () {
    const scheme = {
      type: TYPE.ARRAY,
      $presence: PRESENCE.REQUIRED,
      items: {
        type : TYPE.NUMBER,
        $presence : PRESENCE.REQUIRED,
        compute : () => undefined
      }
    };

    const value = [ 1, undefined, 2];
    const result = validateSync(value, scheme);
    assert.deepEqual(result, []);
  });

});
