class ComponentClass {
  constructor (config = {}, elements = {}) {
    this.config = config
    this.elements = elements
  }

  onConstructed () {}

  onLoaded () {}

  customElements () { return [] }

  onClientReady (clientId) {
    return new Promise((resolve) => {
      resolve()
    })
  }

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

  /* ? */

  registerCommand () {
    return []
  }

  loadElement () {

  }
}

module.exports = ComponentClass
