// const Helper = require('./components.js').export()

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

  // onLoaded () {}

  onClientReady (clientUID, clientName) {
    return true
  }

  onClientDisconnected (clientUID, clientName) {
    return true
  }

  onStart () {}

  injectScripts () { return [] }
  injectStyles () { return [] }
  injectModuleScripts () { return [] }

  webserve (req, res) {
    this.onRequested(req, res)
  }

  staticRoutes () { return [] } // return array of string or array object{route, path}

  onRequested (req, res) {
    res.status(404).send('No response.')
  }

  onMessage (element, msgObj, reply = () => {}) {
    console.info(`${this.name} got message but it will be ignored.`)
    reply(false)
  }

  sendMessage (toPath, msgObj, callback) {
    this.messenger.sendMessage(toPath, msgObj, callback)
  }

  transportData (client, key, data) {
    // transport data to client
    this.messenger.transportData(client, key, data)
  }

  start () {
    this.onStart()
  }

  registerCommand () {
    return []
  }
}

module.exports = ComponentClass
