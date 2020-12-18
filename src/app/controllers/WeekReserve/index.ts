import { Response } from 'express';

import { removeDateTimezoneOffset } from '~/app/utils/date';

import { RequestQuery } from '~/types';

import prisma from '~/prisma';

import { formatReserveToResponse } from '../ReserveController/utils';

type WeekReserveIndex = {
  startDate: string;
  endDate: string;
};

type IndexRequest = RequestQuery<WeekReserveIndex>;

class WeekReserve {
  async index(req: IndexRequest, res: Response) {
    const { startDate, endDate } = req.query;

    const [startYear, startMonth, startDay] = startDate.split('/').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('/').map(Number);

    const tempStartDate = new Date(startYear, startMonth, startDay);
    const tempEndDate = new Date(endYear, endMonth, endDay);

    const startDateWithoutTimezone = removeDateTimezoneOffset(tempStartDate);
    const endDateWithoutTimezone = removeDateTimezoneOffset(tempEndDate);

    const reserves = await prisma.reserve.findMany({
      where: {
        date: {
          gte: startDateWithoutTimezone,
          lt: endDateWithoutTimezone,
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
      const users = reserve.UserReserve.map((userReserve) => userReserve.User);

      const formattedUser = {
        ...formatReserveToResponse(reserve),
        users,
      };

      return formattedUser;
    });

    return res.json(reservesFormatted);
  }
}

export default new WeekReserve();
