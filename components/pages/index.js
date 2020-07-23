const { ComponentClass } = require('../../server/component-helper.js')

class Pages extends ComponentClass {
  start () {
    this.timer = {}
    return new Promise((resolve) => {
      console.log(this.config)
      resolve()
    })
  }

  customElements () {
    return [
      // 'mz-pages-indicator'
      'mz-pages'
    ]
  }

  injectScripts () {
    return [
      // '/pages/static/worker.js'
    ]
  }

  onClientReady (clientId) {
    return new Promise((resolve) => {
      this.refreshTimer(clientId)
    })
  }

  refreshTimer (clientId) {
    /*
    if (this.timer[clientId]) clearTimeout(this.timer[clientId])
    this.timer[clientId] = setTimeout(() => {

    })
    */
  }
}

module.exports = Pages
