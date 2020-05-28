import * as Yup from 'yup';

import UserValidations from '~/app/schemasValidations/User';

interface ValidationFormat {
  [key: string]: {
    schema: Yup.ObjectSchema;
    path: 'body' | 'params';
  };
}

const Validation: ValidationFormat = {
  'POST:/users': {
    schema: UserValidations.UserStoreSchema,
    path: 'body',
  },
  'PUT:/users': {
    schema: UserValidations.UserUpdateSchema,
    path: 'body',
  },
};

export default Validation;
