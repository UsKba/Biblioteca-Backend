import { Request, Response, NextFunction } from 'express';

import prisma from '~/prisma';

import { decodeToken } from '../utils/auth';

interface AuthRequest extends Request {
  userEnrollment?: string;
}

export default async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({ error: 'Token not provided.' });
  }

  // Bearer YOUR_TOKEN
  const [, token] = authHeader.split(' ');
  const tokenDecoded = await decodeToken(token);

  if (!tokenDecoded) {
    return res.status(400).json({ error: 'Token Invalid.' });
  }

  const { enrollment } = tokenDecoded;
  const user = await prisma.user.findOne({ where: { enrollment } });

  if (!user) {
    return res.status(401).json({ error: 'User not found.' });
  }

  req.userEnrollment = tokenDecoded.enrollment;
  return next();
};
