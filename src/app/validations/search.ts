import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const SearchIndexSchema = Yup.object().shape({
  name: Yup.string(),
  email: Yup.string(),
  enrollment: Yup.number().typeError('A matrícula precisa ser um número'),
});

export async function validateSeachIndex(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(SearchIndexSchema, request.query);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
