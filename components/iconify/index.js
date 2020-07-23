const { ComponentClass } = require('../../server/component-helper.js')

class Iconify extends ComponentClass {
  injectScripts () {
    return ['https://code.iconify.design/1/1.0.7/iconify.min.js']
  }
}

module.exports = Iconify
