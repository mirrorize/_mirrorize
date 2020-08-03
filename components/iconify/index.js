const { ComponentClass } = require('../../server/component-helper.js')

module.exports = class extends ComponentClass {
  injectModuleScripts () {
    return [
      '/iconify/public/iconify.mjs'
    ]
  }
}
