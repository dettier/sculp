/* eslint-env mocha*/
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { Type } from '../src/index';
import { getSubScheme, getSubSchemeHandlingPseudoFields } from '../src/helper';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('helper', function () {

  const scheme = {
    type : Type.OBJECT,
    properties : {
      strProp : { type : Type.STRING },
      arrayProp : {
        type : Type.ARRAY,
        items : { type : Type.STRING }
      }
    }
  };

  describe('getSubScheme:', function () {

    it('should return root scheme', function () {
      assert.strictEqual(getSubScheme(scheme, ''), scheme);
    });

    it('should return subfield schemes', function () {
      assert.strictEqual(getSubScheme(scheme, '.strProp'),
        scheme.properties.strProp);
      assert.strictEqual(getSubScheme(scheme, '.arrayProp'),
        scheme.properties.arrayProp);
      assert.strictEqual(getSubScheme(scheme, '.arrayProp[0]'),
        scheme.properties.arrayProp.items);
      assert.strictEqual(getSubScheme(scheme, '.arrayProp[100]'),
        scheme.properties.arrayProp.items);
      assert.strictEqual(getSubScheme(scheme, '.arrayProp.items'),
        undefined);
    });

  });

  describe('getSubSchemeHandlingPseudoFields:', function () {

    it('should return root scheme', function () {
      assert.strictEqual(getSubSchemeHandlingPseudoFields(scheme, ''), scheme);
    });

    it('should return subfield schemes', function () {
      assert.strictEqual(getSubSchemeHandlingPseudoFields(scheme, '.strProp'),
        scheme.properties.strProp);
      assert.strictEqual(getSubSchemeHandlingPseudoFields(scheme, '.arrayProp'),
        scheme.properties.arrayProp);
      assert.strictEqual(getSubSchemeHandlingPseudoFields(scheme, '.arrayProp[0]'),
        scheme.properties.arrayProp.items);
      assert.strictEqual(getSubSchemeHandlingPseudoFields(scheme, '.arrayProp[100]'),
        scheme.properties.arrayProp.items);
      assert.strictEqual(getSubSchemeHandlingPseudoFields(scheme, '.arrayProp.items'),
        scheme.properties.arrayProp.items);
      assert.strictEqual(getSubSchemeHandlingPseudoFields(scheme, '.arrayProp.item'),
        undefined);
    });

  });

});
