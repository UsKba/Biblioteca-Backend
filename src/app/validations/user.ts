import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const UserStoreSchema = Yup.object().shape({
  enrollment: Yup.number().required(),
  password: Yup.string().required(),
});

export async function validateUserStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(UserStoreSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
