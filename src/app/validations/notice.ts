import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const NoticeSchema = Yup.object().shape({
  title: Yup.string().required('O título é requerido'),
  imageCode: Yup.number().required('A imagem é requerida').typeError('imagem inválida'),
  content: Yup.string().required('O conteudo é requerido'),
  expiredAt: Yup.date().required('A data de expiração é requerida').typeError('data de expiração inválida'),
});

export async function validateNoticeStore(req: Request, res: Response, next: NextFunction) {
  const error = await validateSchema(NoticeSchema, req.body);

  if (error) {
    return res.status(400).json(error);
  }

  return next();
}
