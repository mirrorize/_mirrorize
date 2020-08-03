const { ComponentClass } = require('../../server/component-helper.js')

module.exports = class extends ComponentClass {
  injectStyles () {
    return [
      '/fontawesome/public/fontawesome/css/all.css'
    ]
  }

  injectModuleScripts () {
    return [
      '/fontawesome/public/fontawesome.mjs'
    ]
  }
}
