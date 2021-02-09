import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const periodStoreSchema = Yup.object().shape({
  name: Yup.string().required('O nome é requerido'),
});

export async function validatePeriodStore(req: Request, res: Response, next: NextFunction) {
  const error = await validateSchema(periodStoreSchema, req.body);

  if (error) {
    return res.status(400).json(error);
  }

  return next();
}
