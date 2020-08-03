const Helper = require('./components.js').export()

class ComponentClass {
  constructor (_config) {
    const {
      config = {},
      _moduleScripts = null,
      _scripts = null,
      _styles = null,
      disabled = false,
      elements = {}
    } = _config
    if (disabled) {
      console.warn('Component will not constructed(disabled: true)')
      return new Error('Component will not constructed(disabled: true)')
    }
    this.config = config
    this.elements = elements
    this.customOverride = { _moduleScripts, _scripts, _styles }
  }

  onConstructed () {}

  onLoaded () {}

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
