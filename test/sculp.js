/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { Sculp, Type, Presence } from '../src/index';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('Sculp class:', function () {

  const scheme = {
    type : Type.OBJECT,
    $presence : Presence.REQUIRED,
    properties : {
      lessThan5 : { type : Type.NUMBER, $lt : 5 },
      moreThan5 : { type : Type.NUMBER, $gt : 5 },
    }
  };

  describe('getErrors', function () {

    it('should return all errors for whole object', function () {

      const sculp = new Sculp({ lessThan5 : 6, moreThan5 : 4 }, scheme);
      const errors = sculp.getErrors();

      assert.deepEqual(errors, [ {
        field : '.lessThan5',
        message : 'value must be less than 5',
        name : undefined,
        rule : '$lt',
        value : 6
      }, {
        field : '.moreThan5',
        message : 'value must be greater than 5',
        name : undefined,
        rule : '$gt',
        value : 4
      } ]);

    });

    it('should return error when trying to get field errors when option is not provided',
    function () {

      const sculp = new Sculp({ lessThan5 : 6, moreThan5 : 4 }, scheme);
      assert.throws(() => sculp.getErrors('.lessThan5'),
        'Use extendFieldStatesWithErrors option to get errors for specific fields');

    });

    it('should return field errors when path argument is provided', function () {

      const sculp = new Sculp({ lessThan5 : 6, moreThan5 : 4 }, scheme,
        { extendFieldStatesWithErrors : true });

      const errors = sculp.getErrors('.lessThan5');

      assert.deepEqual(errors, [ {
        field : '.lessThan5',
        message : 'value must be less than 5',
        name : undefined,
        rule : '$lt',
        value : 6
      } ]);

    });

  });

});
