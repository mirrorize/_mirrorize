const { ComponentClass } = require('../../server/component-helper.js')

module.exports = class extends ComponentClass {
  customElements () {
    return [
      'mz-layout',
      'mz-layout-holder',
      'mz-notify',
      'mz-notify-item'
    ]
  }

  injectModuleScripts () {
    return [
      '/core/static/core.mjs'
    ]
  }

  injectStyles () {
    return [
      '/core/static/core.css'
    ]
  }
}
