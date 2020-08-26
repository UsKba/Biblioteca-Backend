const reserveConfig = {
  minClassmatesPerRoom: 3,
  maxReservesPerTurn: 2,

  turns: {
    morning: {
      initialHour: 7,
      endHour: 12,
    },
    afternoon: {
      initialHour: 13,
      endHour: 18,
    },
    nigth: {
      initialHour: 19,
      endHour: 22,
    },
  },
};

export default reserveConfig;
