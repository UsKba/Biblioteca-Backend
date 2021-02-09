import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const UserReserveStatusPost = Yup.object().shape({
  reserveId: Yup.number().required('O id da reserva é requerido').typeError('O id da reserva precisa ser um número'),
});

export async function validateUserReserveStatusPostParams(req: Request, res: Response, next: NextFunction) {
  const error = await validateSchema(UserReserveStatusPost, req.params);

  if (error) {
    return res.status(400).json(error);
  }

  return next();
}
