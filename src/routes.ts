import { Router } from 'express';
import * as Yup from 'yup';
import UserController from './app/controllers/UserController';

const routes = Router();

async function validateSchema(schema: Yup.ObjectSchema, params: object) {
  try {
    await schema.validate(params);
    return undefined;
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return { error: err.message };
    }

    return err;
  }
}

const UserStoreSchema = Yup.object().shape({
  name: Yup.string().required(),
  age: Yup.number().required(),
});

const UserUpdateSchema = Yup.object().shape({
  id: Yup.number().required(),
  name: Yup.string(),
  age: Yup.number(),
});

interface ValidationFormat {
  [key: string]: {
    schema: Yup.ObjectSchema;
    path: 'body' | 'params';
  };
}

const Validation: ValidationFormat = {
  'POST:/users': {
    schema: UserStoreSchema,
    path: 'body',
  },
  'PUT:/users': {
    schema: UserUpdateSchema,
    path: 'body',
  },
};

routes.use(async (request, response, next) => {
  const validationPath = `${request.method}:${request.originalUrl}`;

  if (!(validationPath in Validation)) {
    return next();
  }

  const { schema, path } = Validation[validationPath];

  const error = await validateSchema(schema, request[path]);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
});

routes.get('/', (request, response) => {
  return response.json({});
});

routes.get('/users', UserController.index);
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

export default routes;
