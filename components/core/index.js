const { ComponentClass } = require('../../server/component-helper.js')

module.exports = class extends ComponentClass {
  customElements () {
    return [
      'mz-notify',
      'mz-notify-item'
    ]
  }

  injectModuleScripts () {
    return [
      '/core/static/core.mjs'
    ]
  }

  injectScripts () {
    return [
      '/3rdparty/moment.js',
      '/3rdparty/moment-timezone.js'
    ]
  }

  injectStyles () {
    return [
      '/core/static/core.css'
    ]
  }

  onLoaded () {
  }
}
