import { Request, Response, NextFunction } from 'express';

import prisma from '~/prisma';

import { decodeToken } from '../utils/auth';

export interface AuthRequest extends Request {
  userId?: number;
  userEnrollment?: string;
  userRoleSlug?: string;
}

async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({ error: 'Token não informado' });
  }

  // Bearer YOUR_TOKEN
  const [, token] = authHeader.split(' ');
  const tokenDecoded = await decodeToken(token);

  if (!tokenDecoded) {
    return res.status(400).json({ error: 'Token Invalido' });
  }

  const { id } = tokenDecoded;
  const user = await prisma.user.findOne({ where: { id }, include: { role: true } });

  if (!user) {
    return res.status(401).json({ error: 'Usuário não encontrado' });
  }

  req.userId = user.id;
  req.userEnrollment = user.enrollment;
  req.userRoleSlug = user.role.slug;

  return next();
}

export default authMiddleware;
