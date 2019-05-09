var _ref, _ref2, _;

var inc = x => x + 1;

var result = inc(4 || 9);
expect(result).toBe(5);

var f = x => x + 10;

var h = x => x + 20;

var result2 = inc((f || h)(10));
expect(result2).toBe(21);
