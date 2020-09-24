import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const InviteStoreSchema = Yup.object().shape({
  recipientId: Yup.number()
    .required('O id do destinatário é obrigatório.')
    .typeError('O id do destinatário precisa ser um número'),
});

export async function validateInviteStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(InviteStoreSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
