import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const RoomSchema = Yup.object().shape({
  initials: Yup.string().required('A sigla é requerida'),
});

export async function validateRoomStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(RoomSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
