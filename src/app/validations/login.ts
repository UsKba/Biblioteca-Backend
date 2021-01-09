import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema, validateUserEnrollmentIsValidYup } from '~/app/utils/yup';

const LoginSchema = Yup.object().shape({
  name: Yup.string().required('O nome é requerido'),
  email: Yup.string().email('Email inválido').required('O email é requerido'),
  enrollment: Yup.number()
    .required('A matrícula é requerida')
    .typeError('A matrícula precisa ser composta apenas por números')
    .test('should validade enrollment', 'Matrícula inválida', validateUserEnrollmentIsValidYup),
});

export async function validateLoginStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(LoginSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
