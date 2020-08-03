const { ComponentClass } = require('../../server/component-helper.js')

module.exports = class extends ComponentClass {
  injectScripts () {
    return [
      'https://code.iconify.design/2/2.0.0-beta.3/iconify.min.js'
    ]
  }

  injectStyles () {
    return [
      {
        id: 'font-awesome',
        src: '/3rdparty/fontawesome/css/all.css'
      }
    ]
  }

  injectModuleScripts () {
    return [
      '/iconframework/public/iconframework.mjs'
    ]
  }
}
