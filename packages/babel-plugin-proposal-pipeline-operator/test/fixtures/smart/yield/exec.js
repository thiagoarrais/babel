function *myGenerator() {
  const value = -5.9
  |> Math.abs
  |> (yield #);
}

const iterator = myGenerator();
const value = iterator.next();

expect(value).toBe(5.9);
