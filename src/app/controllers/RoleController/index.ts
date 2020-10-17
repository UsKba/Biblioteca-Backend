import { Response } from 'express';

import { slug } from '~/app/utils/string';

import { Request, RequestBody } from '~/types';

import prisma from '~/prisma';

interface StoreRole {
  name: string;
}

type StoreRequest = RequestBody<StoreRole>;

class RoleController {
  async index(req: Request, res: Response) {
    const roles = await prisma.role.findMany({});

    return res.json(roles);
  }

  async store(req: StoreRequest, res: Response) {
    const { name } = req.body;

    const slugName = slug(name);

    const role = await prisma.role.create({
      data: {
        name,
        slug: slugName,
      },
    });

    return res.json(role);
  }
}

export default new RoleController();
