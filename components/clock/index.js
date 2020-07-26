const { ComponentClass, ComponentHelper } = require('../../server/component-helper.js')
const moment = require('moment')

module.exports = class extends ComponentClass {
  customElements () {
    return [
      'mz-clock',
      'mz-clock-particle'
    ]
  }

  injectScripts () {
    return [
      '/3rdparty/moment.js',
      '/3rdparty/moment-timezone.js'
    ]
  }

  onConstructed () {
    var override = {}
    if (this.config.locale) override.locale = this.config.locale
    if (this.config.timezone) override.timezone = this.config.timezone
    if (this.elements['mz-clock']) {
      this.elements['mz-clock'] = Object.assign({}, override, this.elements['mz-clock'])
    }
  }

  onStart () {
    this.registerCompliment()
  }

  registerCompliment () {
    var components = ComponentHelper.listComponents()
    for (var c of components) {
      if (typeof c.updateCompliment === 'function') {
        c.updateCompliment(
          'now',
          [
            "It's {{RETURN}}.",
            '{{RETURN}}'
          ],
          () => {
            return moment().format('LLL')
          }
        )
      }
    }
  }
}
