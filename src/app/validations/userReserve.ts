import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const UserReserveDeleteSchema = Yup.object().shape({
  reserveId: Yup.number().required('O id da reserva é requerido').typeError('O id da reserva precisa ser um número'),
  userId: Yup.number().required('O id do usuário é requerido').typeError('O id do usuário precisa ser um número'),
});

export async function validateReserveDeleteParams(req: Request, res: Response, next: NextFunction) {
  const error = await validateSchema(UserReserveDeleteSchema, req.params);

  if (error) {
    return res.status(400).json(error);
  }

  return next();
}
