const Helper = require('./components.js').export()

class ComponentClass {
  constructor (config = {}, elements = {}) {
    this.config = config
    this.elements = elements
  }

  onConstructed () {}

  onLoaded () {}

  customElements () { return [] }

  onClientReady (clientId) {}

  start () {
    return new Promise((resolve) => {
      this.onStart()
      resolve()
    })
  }

  onStart () {}

  injectScripts () { return [] }
  injectStyles () { return [] }
  injectModuleScripts () { return [] }

  webserve (req, res) {
    this.onRequested(req, res)
  }

  onRequested (req, res) {
    res.status(404).send('No response.')
  }

  getHelper () {
    return this.helper
  }

  onClientMessage (message) {
    console.log(`Component ${this.id} is received message from client.`)
    return 'SUCCESS'
  }

  sendMessageToClient (to, message) {
    var from = {
      _component: this.id
    }
    Helper.sendMessageToClient(from, to, message)
  }

  sendMessage () {}

  /* ? */

  registerCommand () {
    return []
  }

  loadElement () {

  }
}

module.exports = ComponentClass
