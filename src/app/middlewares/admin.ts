import { NextFunction, Response } from 'express';

import userConfig from '~/config/user';

import prisma from '~/prisma';

import { AuthRequest } from './auth';

async function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = Number(req.userId);

  const user = await prisma.user.findOne({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    // should never enter here (cause of authMiddleware)
    return res.status(401).json({ error: 'Usuário não encontrado' });
  }

  if (user.role.slug !== userConfig.role.admin.slug) {
    return res.status(401).json({ error: 'Apenas administradores podem realizar essa ação' });
  }

  return next();
}

export default adminMiddleware;
