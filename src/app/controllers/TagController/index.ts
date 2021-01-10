import { Response } from 'express';

import { Request } from '~/types/request';

import prisma from '~/prisma';

class TagController {
  async index(req: Request, res: Response) {
    const tags = await prisma.tag.findMany({});

    return res.json(tags);
  }
}

export default new TagController();
