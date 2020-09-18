import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

export const ParamsIdSchema = Yup.object().shape({
  id: Yup.number().required().typeError('id precisa ser um número'),
});

export async function validateParamsId(req: Request, res: Response, next: NextFunction) {
  const error = await validateSchema(ParamsIdSchema, req.params);

  if (error) {
    return res.status(400).json(error);
  }

  return next();
}
