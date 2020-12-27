export interface GenerateDateParams {
  sumYear?: number;
  sumMonth?: number;
  sumDay?: number;
}

type GenerateDateListParams = GenerateDateParams[];

function formatDate(date: Date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

function getNextWeekDayDate(params?: GenerateDateParams, rootDate?: Date) {
  function getNextWeekDay(date: Date) {
    const weekDay = date.getDay();

    if (weekDay === 0) {
      return date.getUTCDate() + 1;
    }

    if (weekDay === 6) {
      return date.getUTCDate() + 2;
    }

    return date.getUTCDate();
  }

  const date = rootDate || new Date();

  const newYear = date.getUTCFullYear() + Number(params?.sumYear || 0);
  const newMonth = date.getUTCMonth() + Number(params?.sumMonth || 0);
  const newDay = date.getUTCDate() + Number(params?.sumDay || 0);

  const newDate = new Date(newYear, newMonth, newDay);
  const day = getNextWeekDay(newDate);

  return new Date(newYear, newMonth, day);
}

export function generateDate(params?: GenerateDateParams) {
  const date = getNextWeekDayDate(params);

  return formatDate(date);
}

export function generateDateList(params: GenerateDateListParams) {
  function calculateSums() {
    const paramsArray = [];

    const sumParams = {
      day: 0,
      month: 0,
      year: 0,
    };

    for (let i = 0; i < params.length; i += 1) {
      const sumDay = Number(params[i]?.sumDay || 0);
      const sumMonth = Number(params[i]?.sumMonth || 0);
      const sumYear = Number(params[i]?.sumYear || 0);

      const newParams = {
        sumDay: sumDay - sumParams.day,
        sumMonth: sumMonth - sumParams.month,
        sumYear: sumYear - sumParams.year,
      };

      sumParams.day += sumDay;
      sumParams.month += sumMonth;
      sumParams.year += sumYear;

      paramsArray.push(newParams);
    }

    return paramsArray;
  }

  const dates = [];
  const paramsArray = calculateSums();

  let rootDate = new Date();
  for (let i = 0; i < paramsArray.length; i += 1) {
    const newDate = getNextWeekDayDate(paramsArray[i], rootDate);

    dates.push(formatDate(newDate));
    rootDate = newDate;
  }

  return dates;
}
