/*eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

const assert = require('chai').assert;

import DependencyTracker from '../src/dependency-tracker';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('dependency-tracker:', function () {

  it('should track dependencies', function () {

    const dt = new DependencyTracker();

    dt.registerDependency('.b', '.prop.a');
    dt.registerDependency('.c', '.prop');

    let result = dt.getDependencies('.prop');
    assert.deepEqual(result, [ '.c' ]);

    result = dt.getDependencies('.prop.a');
    assert.deepEqual(result, [ '.b' ]);

    result = dt.getDependencies('.prop.b');
    assert.deepEqual(result, []);

    dt.clearDependencies('.b');
    result = dt.getDependencies('.prop.a');
    assert.deepEqual(result, []);
  });

});
