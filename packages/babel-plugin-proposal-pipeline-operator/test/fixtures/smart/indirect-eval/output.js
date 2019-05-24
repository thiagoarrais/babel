(function () {
  'use strict';

  var result = (0, eval)('(function() { return this; })()');
  expect(result).not.toBeUndefined();
})();
