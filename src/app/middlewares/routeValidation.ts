import { Request, Response, NextFunction } from 'express';

import Validation from '~/routes/validations';
import { validateSchema } from '~/app/utils/yup';

async function routeValidation(request: Request, response: Response, next: NextFunction) {
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
}

export default routeValidation;
