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

export async function validateRoomStore(req: Request, res: Response, next: NextFunction) {
  const error = await validateSchema(RoomStoreSchema, req.body);

  if (error) {
    return res.status(400).json(error);
  }

  return next();
}

export async function validateRoomUpdate(req: Request, res: Response, next: NextFunction) {
  const error = await validateSchema(RoomUpdateSchema, req.body);

  if (error) {
    return res.status(400).json(error);
  }

  return next();
}
