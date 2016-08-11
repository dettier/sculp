////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import isArray from 'lodash-compat/lang/isArray';
import unique from 'lodash-compat/array/unique';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

class DependencyTracker {

  constructor () {
    this.deps = {};
    this.depsRev = {};
  }

  clearDependencies (field) {
    Object.keys(this.depsRev[field] || {}).forEach((f) =>
      delete this.deps[f][field]);
    this.deps[field] = {};
  }

  registerDependency (field, dependOn) {
    let v = this.deps[dependOn];
    if (v == null)
      this.deps[dependOn] = v = {};
    v[field] = 1;

    v = this.depsRev[field];
    if (v == null)
      this.depsRev[field] = v = {};
    v[dependOn] = 1;
  }

  _addDependencies (field, result) {
    const deps = Object.keys(this.deps[field] || {});

    for (let i = 0; i < deps.length; i++) {
      result.push(deps[i]);
      this._addDependencies(deps[i], result);
    }
  }


  getDependencies (fieldOrFields) {
    const result = [];

    let fields;
    if (isArray(fieldOrFields))
      fields = fieldOrFields;
    else
      fields = [ fieldOrFields ];

    for (let i = 0; i < fields.length; i++)
      this._addDependencies(fields[i], result);

    return unique(result);
  }

}

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

export default DependencyTracker;
