import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const FriendRequestStoreSchema = Yup.object().shape({
  receiverEnrollment: Yup.number()
    .required('A matrícula do destinatário é obrigatório.')
    .typeError('A matrícula do destinatário precisa ser um número'),
});

export async function validateFriendRequestStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(FriendRequestStoreSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
