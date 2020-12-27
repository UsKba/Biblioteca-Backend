import colorsConfig from '~/config/colors';

import prisma from '~/prisma';

import { getRandomItem, subtractElements } from './array';

function getRandomColorIndex(allColorsIndexes: number[], colorsIndexes: number[]) {
  const disponibleColors = subtractElements(allColorsIndexes, colorsIndexes);

  const colorIndex = getRandomItem(disponibleColors);

  return colorIndex;
}

export async function getNextUserColor() {
  const [userColor] = await prisma.userColor.findMany({});
  const colorsIndexes = userColor.colors.split(',').map(Number);

  const allColorsIndexes = Object.keys(colorsConfig).map((color, index) => index);

  const colorIndex = getRandomColorIndex(allColorsIndexes, colorsIndexes);
  const color = Object.values(colorsConfig)[colorIndex];

  const colorsIndexesUpdated = [...colorsIndexes, colorIndex];

  if (colorsIndexesUpdated.length === allColorsIndexes.length) {
    await prisma.userColor.update({
      data: { colors: '' },
      where: { id: userColor.id },
    });

    return color;
  }

  const colorsIndexesUpdatedString = String(colorsIndexesUpdated);

  await prisma.userColor.update({
    data: { colors: colorsIndexesUpdatedString },
    where: { id: userColor.id },
  });

  return color;
}
