import * as Yup from 'yup';

const UserStoreSchema = Yup.object().shape({
  name: Yup.string().required(),
  age: Yup.number().required(),
});

const UserUpdateSchema = Yup.object().shape({
  id: Yup.number().required(),
  name: Yup.string(),
  age: Yup.number(),
});

export default {
  UserStoreSchema,
  UserUpdateSchema,
};
