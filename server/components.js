const path = require('path')

function _require (required) {
  try {
    var r = require(required)
    return r
  } catch (e) {
    return e
  }
}

class _Components {
  init (_config = {}) {
    this.components = []
    this.config = _config
    return new Promise((resolve, reject) => {
      if (
        !Object.prototype.hasOwnProperty.call(_config, 'list') ||
        !Array.isArray(_config.list) ||
        _config.list.length < 1
      ) {
        console.warn('There is no list of components to execute. This would not be the error but need to check your configuration.')
        resolve()
      }

      this.config.list = [...new Set(_config.list)]
      for (const name of this.config.list) {
        const dir = path.join(__dirname, '..', 'components', name)
        const cPath = path.join(dir, 'index.js')
        const configPath = path.join(dir, 'config.js')
        var config = _require(configPath)
        if (config instanceof Error) {
          console.warn('Invalid config:', name)
          console.warn(`Component:${name} will be instanced without configuration.`)
          config = {}
        }
        var Klass = _require(cPath)
        if (Klass instanceof Error) {
          console.warn('Fails to find component:', name)
          console.warn(Klass)
          console.warn(`Component:${name} will not be loaded.`)
          continue
        }
        const { component: compConfig = {}, ...elements } = config
        var component = new Klass(compConfig, elements)
        if (component instanceof Error) {
          console.warn('Fails to load component:', name)
          console.warn(config.message)
          console.info(`Component ${name} will not be loaded.`)
        } else {
          var id
          if (config.id && !this.findById(config.id)) {
            id = config.id
          } else {
            let i = 2
            id = name
            while (this.findById(id)) {
              id = name + i++
            }
          }
          Object.defineProperty(component, 'id', {
            value: id,
            writable: false
          })
          Object.defineProperty(component, 'name', {
            value: name,
            writable: false
          })
          Object.defineProperty(component, 'dir', {
            value: dir,
            writable: false
          })
          Object.defineProperty(component, 'url', {
            value: '/' + name,
            writable: false
          })
          component.onConstructed()
          console.info(`Component '${name}' is constructed. (id:${id})`)
          this.components.push(component)
          component.onLoaded()
          console.info(`Component '${name}' is loaded. (id:${id})`)
        }
      }
      resolve()
    })
  }

  list () {
    return this.components
  }

  findById (id) {
    return this.components.find((c) => {
      return (c.id === id)
    })
  }

  start () {
    return new Promise((resolve) => {
      var promises = []
      this.components.forEach((component, i) => {
        promises.push(component.start())
      })
      Promise.allSettled(promises).then(resolve)
    })
  }

  prepareComponent (job = (component) => {}) {
    return new Promise((resolve) => {
      var promises = []
      this.components.forEach((component, i) => {
        promises.push(job(component))
      })
      Promise.all(promises).then(() => {
        resolve()
      })
    })
  }

  listId () {
    var r = this.components.map((component) => {
      return component.id
    })
    return r
  }

  allCustomElements () {
    var ce = []
    for (var component of this.components) {
      var cce = component.customElements()
      if (cce && Array.isArray(cce) && cce.length > 0) {
        for (var e of cce) {
          if (!ce.find((item) => {
            return (item.name === e)
          })) {
            var file = e + '.js'
            ce.push({
              name: e,
              path: path.join(component.dir, 'elements', file),
              url: component.url + '/elements/' + file,
              config: (component.elements[e]) ? component.elements[e] : null
            })
          } else {
            console.warn(`Custom Element '${component.id}.${e}' seems duplicated. It will be ignored.'`)
          }
        }
      }
    }
    return ce
  }

  allInjectScripts () {
    var is = []
    for (var component of this.components) {
      var cis = component.injectScripts()
      if (cis && Array.isArray(cis) && cis.length > 0) {
        for (var s of cis) {
          if (!is.find((item) => {
            return (item === s)
          })) {
            is.push(s)
          } else {
            console.warn(`Script to inject '${s}' of '${component.id}' seems duplicated. It will be ignored.'`)
          }
        }
      }
    }
    return is
  }

  allInjectStyles () {
    var is = []
    for (var component of this.components) {
      var cis = component.injectStyles()
      if (cis && Array.isArray(cis) && cis.length > 0) {
        for (var s of cis) {
          if (!is.find((item) => {
            return (item === s)
          })) {
            is.push(s)
          } else {
            console.warn(`Styles to inject '${s}' of '${component.id}' seems duplicated. It will be ignored.'`)
          }
        }
      }
    }
    return is
  }

  allInjectModuleScripts () {
    var is = []
    for (var component of this.components) {
      var cis = component.injectModuleScripts()
      if (cis && Array.isArray(cis) && cis.length > 0) {
        for (var s of cis) {
          if (!is.find((item) => {
            return (item === s)
          })) {
            is.push(s)
          } else {
            console.warn(`Module script to inject '${s}' of '${component.id}' seems duplicated. It will be ignored.'`)
          }
        }
      }
    }
    return is
  }

  allInjects (type) {
    var method = ''
    var message = ''
    if (type === 'style') {
      method = 'injectStyles'
      message = 'Stylesheet'
    } else if (type === 'script') {
      method = 'injectScripts'
      message = 'Script'
    } else if (type === 'module') {
      method = 'injectModuleScripts'
      message = 'Module-Script'
    } else {
      console.warn('Invalid injection type:', type)
      return
    }
    var is = []
    for (var component of this.components) {
      var cis = component[method]()
      if (cis && Array.isArray(cis) && cis.length > 0) {
        for (var s of cis) {
          if (!is.find((item) => {
            return (item === s)
          })) {
            is.push(s)
          } else {
            console.warn(`${message} to inject '${s}' of '${component.id}' seems duplicated. It will be ignored.'`)
          }
        }
      }
    }
    return is
  }

  onClientReady (clientId) {
    return new Promise((resolve) => {
      var promises = []
      this.components.forEach((component, i) => {
        promises.push(component.onClientReady(clientId))
      })
      Promise.allSettled(promises).then(resolve)
    })
  }

  export () {
    return {
      listComponents: () => { return this.list() },
      listComponentId: () => { return this.listId() },
      findComponentById: (id) => { return this.findById(id) },
      broadcastMessage: (message) => {},
      sendMessage: (targetModule, message) => {}
    }
  }
}

var Components = new _Components()

module.exports = Components
