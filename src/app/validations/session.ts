import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const SessionSchema = Yup.object().shape({
  enrollment: Yup.number().required('A matrícula é requerida'),
});

export async function validateSessionStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(SessionSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
