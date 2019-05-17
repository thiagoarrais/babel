var _ref;

function then(fn) {
  return async value => {
    return fn((await value));
  };
}

var result = (_ref = (async x => (await x) + 1)(1), then(x => x + 1)(_ref));
result.then(val => {
  expect(val).toBe(3);
});
