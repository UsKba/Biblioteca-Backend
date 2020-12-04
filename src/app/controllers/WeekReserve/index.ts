import { Response } from 'express';

import { RequestQuery } from '~/types';

import prisma from '~/prisma';

type WeekReserveIndex = {
  startDate: string;
  endDate: string;
};

type IndexRequest = RequestQuery<WeekReserveIndex>;

class WeekReserve {
  async index(req: IndexRequest, res: Response) {
    const { startDate, endDate } = req.query;

    const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
    const [endDay, endMonth, endYear] = endDate.split('/').map(Number);

    const startDate1 = new Date(startYear, startMonth, startDay);
    const endDate1 = new Date(endYear, endMonth, endDay);

    const reserves = await prisma.reserve.findMany({
      where: {
        date: {
          gte: startDate1,
          lt: endDate1,
        },
      },
      include: {
        Room: true,
        Schedule: true,
        UserReserve: { include: { User: true } },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const reservesFormatted = reserves.map((reserve) => {
      const users = reserve.UserReserve.map((userReserve) => ({
        ...userReserve.User,
      }));

      const formattedUser = {
        id: reserve.id,
        date: reserve.date,
        room: reserve.Room,
        schedule: reserve.Schedule,
        users,
      };

      return formattedUser;
    });

    return res.json(reservesFormatted);
  }
}

export default new WeekReserve();
