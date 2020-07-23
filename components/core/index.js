const { ComponentClass } = require('../../server/component-helper.js')

class Core extends ComponentClass {
  customElements () {
    return [
      'mz-layout',
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

module.exports = Core
