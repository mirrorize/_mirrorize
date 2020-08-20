const Log = require('./logger.js')('COMPONENTCLASS')
const { configure } = require('./configure.js')
const Helper = require('./components.js').export()

class ComponentClass {
  defaultConfig () {
    return {}
  }

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
      Log.warn('Component will not constructed(disabled: true)')
      return new Error('Component will not constructed(disabled: true)')
    }
    this.config = configure(this.defaultConfig(), config)
    this.elements = elements
    this.customOverride = { _moduleScripts, _scripts, _styles }
  }

  onConstructed () {}

  // onLoaded () {}

  onClientReady (clientUID, clientName) {}

  onClientDisconnected (clientUID) {}

  onStart () {}

  injectScripts () { return [] }
  injectStyles () { return [] }
  injectTemplates () { return [] }
  injectElements () { return [] }

  // injectModuleScripts () { return [] }

  webserve (req, res) {
    this.onRequested(req, res)
  }

  staticRoutes () { return [] } // return array of string or array object{route, path}

  onRequested (req, res) {
    res.status(404).send('No response.')
  }

  onMessage (msgObj, reply = () => {}) {
    Log.info(`${this.name} got message but it will be ignored.`)
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

  suspend (componentName = null, fn = (component) => {}) {
    if (!componentName) {
      this.onSuspend()
      fn(this)
      return
    }
    var component = this.getComponentByName(componentName)
    if (component) {
      component.onSuspend()
      fn(component)
    }
  }

  resume (componentName = null, fn = (component) => {}) {
    if (!componentName) {
      this.onSuspend()
      fn(this)
      return
    }
    var component = this.getComponentByName(componentName)
    if (component) {
      component.onSuspend()
      fn(component)
    }
  }

  onSuspend () {
    Log.info(`Component:${this.name} is asked to be suspended. (ignored)`)
  }

  onResume () {
    Log.info(`Component:${this.name} is asked to be resumed. (ignored)`)
  }

  getComponentByName (componentName) {
    return Helper.getComponentByName(componentName)
  }

  registerCommands () {
    return []
  }
}

module.exports = ComponentClass
