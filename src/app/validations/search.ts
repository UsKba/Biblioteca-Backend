import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const SearchIndexSchema = Yup.object().shape({
  name: Yup.string(),
  email: Yup.string(),
  enrollment: Yup.number().typeError('A matrícula precisa ser um número'),
});

export async function validateSeachIndex(req: Request, res: Response, next: NextFunction) {
  const error = await validateSchema(SearchIndexSchema, req.query);

  if (error) {
    return res.status(400).json(error);
  }

  return next();
}
