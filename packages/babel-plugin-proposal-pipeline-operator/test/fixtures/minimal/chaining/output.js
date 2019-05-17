var inc = x => x + 1;

var double = x => x * 2;

expect(double(inc(10))).toBe(22);
