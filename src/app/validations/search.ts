import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const SearchStoreSchema = Yup.object().shape({
  enrollment: Yup.number().required('A matrícula é obrigatória'),
});

export async function validateSeachShow(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(SearchStoreSchema, request.params);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
