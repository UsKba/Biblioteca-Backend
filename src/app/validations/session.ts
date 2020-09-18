import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const SessionSchema = Yup.object().shape({
  name: Yup.string().required('O nome é requerido'),
  enrollment: Yup.number().required('A matrícula é requerida'),
  email: Yup.string().email().required('O email é requerido'),
});

export async function validateSessionStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(SessionSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
