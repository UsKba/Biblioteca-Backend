import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const MessageStoreSchema = Yup.object().shape({
  senderId: Yup.number().required('O id do remetente é requerido').typeError('O id do remetente precisa ser um número'),
  receiverId: Yup.number()
    .required('O id do destinatário é requerido')
    .typeError('O id do destinatário precisa ser um número'),
  subject: Yup.string().required('O assunto é requerido'),
  content: Yup.string().required('Não se pode criar uma messagem sem conteudo'),
  tags: Yup.array().of(Yup.number()),
});

export async function validateMessageStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(MessageStoreSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
