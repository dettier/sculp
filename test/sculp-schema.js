////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import isEmpty from 'lodash-compat/lang/isEmpty';
import { Type, Presence } from '../src/enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

const schema = {
  type : Type.OBJECT,
  properties : {

    firstname : {
      type : Type.STRING,
      $presence : Presence.REQUIRED
    },

    lastname : {
      type : Type.STRING,
      $presence : Presence.REQUIRED
    },

    fullname : {
      type : Type.STRING,
      compute : (fa) =>
        `${fa('^.firstname')} ${fa('^.lastname')}`
    },

    address : {
      type : Type.STRING,
      $presence : Presence.OPTIONAL
    },

    mailingAddress : {
      type : Type.STRING,
      $presence : (fa) =>
        isEmpty(fa('^.address')) ? Presence.ABSENT : Presence.OPTIONAL
    },

    agreedToTerms : {
      type : Type.BOOLEAN,
      $values : {
        value : [ true ],
        message : 'You should agree to terms'
      }
    }

  }
};

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

export default schema;
