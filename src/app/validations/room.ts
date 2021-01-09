import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const RoomStoreSchema = Yup.object().shape({
  initials: Yup.string().required('A sigla é requerida'),
});

const RoomUpdateSchema = Yup.object().shape({
  initials: Yup.string(),
  status: Yup.number(),
});

export async function validateRoomStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(RoomStoreSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}

export async function validateRoomUpdate(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(RoomUpdateSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
