const { ComponentClass } = require('../../server/component-helper.js')

module.exports = class extends ComponentClass {
  injectModuleScripts () {
    return [
      '/core/public/core.mjs'
    ]
  }
}
