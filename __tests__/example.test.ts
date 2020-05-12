const soma = (a: number, b: number) => a + b;

test('ALOU', () => {
  const result = soma(4, 5);

  expect(result).toBe(9);
});
