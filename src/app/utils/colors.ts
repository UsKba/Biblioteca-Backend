import { Color } from '@prisma/client';

import prisma from '~/prisma';

import { getRandomItem } from './array';

export async function getRandomColor() {
  const colors = await prisma.color.findMany({});
  const color = getRandomItem(colors);

  return color;
}

export async function getRandomColorList(length: number) {
  const colors = await prisma.color.findMany({});

  const randomColorsList = [];
  let colorsAlreadyDrawn: number[] = [];

  for (let i = 0; i < length; i += 1) {
    let color = getRandomItem<Color>(colors);

    // [to-do] retirar de colors que ja foram usadas e `colors`
    while (colorsAlreadyDrawn.includes(color.id)) {
      color = getRandomItem(colors);
    }

    colorsAlreadyDrawn.push(color.id);
    randomColorsList.push(color);

    if (colorsAlreadyDrawn.length === colors.length) {
      colorsAlreadyDrawn = [];
    }
  }

  return randomColorsList;
}
