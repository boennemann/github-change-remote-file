const _ = require('lodash')
const { bind, defaults } = _

module.exports = function (defaulDefault) {
  return bind(defaults, null, _, defaulDefault)
}
