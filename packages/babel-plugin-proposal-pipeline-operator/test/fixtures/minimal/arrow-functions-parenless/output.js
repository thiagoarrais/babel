const y = 2;

const f = x => {
  var _z, _y;

  return _z = (_y = x, _y + 1), _z * y;
};

const g = x => {
  var _y2, _z2;

  return _y2 = x, (_z2 = _y2 + 1, _z2 * _y2);
};

const h = x => {
  var _y3, _z3;

  return _y3 = x, (_z3 = _y3 + 1, _z3 * _y3);
};

expect(f(1)).toBe(4);
expect(g(1)).toBe(2);
expect(h(1)).toBe(2);
