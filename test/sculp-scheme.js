////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import isEmpty from 'lodash-compat/lang/isEmpty';
import { TYPE, PRESENCE } from '../lib/enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

const scheme = {
  type : TYPE.OBJECT,
  properties : {

    firstname : {
      type : TYPE.STRING,
      $presence : PRESENCE.REQUIRED
    },

    lastname : {
      type : TYPE.STRING,
      $presence : PRESENCE.REQUIRED
    },

    fullname : {
      type : TYPE.STRING,
      compute : (fa) =>
        `${fa('^.firstname')} ${fa('^.lastname')}`
    },

    address : {
      type : TYPE.STRING,
      $presence : PRESENCE.OPTIONAL
    },

    mailingAddress : {
      type : TYPE.STRING,
      $presence : (fa) =>
        isEmpty(fa('^.address')) ? PRESENCE.ABSENT : PRESENCE.OPTIONAL
    },

    agreedToTerms : {
      type : TYPE.BOOLEAN,
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

export default scheme;
