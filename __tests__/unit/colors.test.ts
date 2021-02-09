import { getRandomColorList } from '~/app/utils/colors';

describe('getRandomColorList', () => {
  it('should have a list of 3 different colors', async () => {
    const colors = await getRandomColorList(3);

    expect(colors.length === 3);

    expect(colors[0].color !== colors[1].color).toBeTruthy();
    expect(colors[0].color !== colors[2].color).toBeTruthy();
    expect(colors[1].color !== colors[2].color).toBeTruthy();
  });
});
