import { isBefore } from 'date-fns';

import { getDateOnBrazilTimezone } from '~/app/utils/date';

import { RequestError } from '~/app/errors/request';

import errorConfig from '~/config/error';

export function assertNoticeExpiredDateIsNotBeforeOfNow(date: Date) {
  const now = new Date();
  const dateOnBrazilTimezone = getDateOnBrazilTimezone(now);

  if (isBefore(date, dateOnBrazilTimezone)) {
    throw new RequestError({
      message: 'A data não pode ser anterior a atual',
      errorCode: errorConfig.expiredDateBeforeOfNow,
    });
  }
}
