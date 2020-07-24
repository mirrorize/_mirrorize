const { ComponentClass } = require('../../server/component-helper.js')

class Feedreader extends ComponentClass {
  customElements () {
    return [
      'mz-feedreader'
    ]
  }

  onClientMessage (message) {
    return 'TEST_SUCCESS'
  }

  onConstructed () {
    if (
      this.elements['mz-feedreader'] &&
      typeof this.elements['mz-feedreader'].bindTo === 'undefined'
    ) {
      this.elements['mz-feedreader'].bindTo = this.id
    }
  }
}

module.exports = Feedreader
