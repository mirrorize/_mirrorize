const path = require('path')
const fs = require('fs')
const Clients = require('./clients.js')

function _require (required) {
  try {
    var r = require(required)
    return r
  } catch (e) {
    console.warn(`${required} doesn't exist.`)
    return null
  }
}

class _Components {
  init (_config = {}) {
    this.components = []
    this.config = _config
    this.clientPrepares = null
    return new Promise((resolve, reject) => {
      (async () => {
        var list = await this.scanComponents()
        if (!Array.isArray(list) || list.length <= 0) {
          console.warn('There is no component to load. This would not be the error but need to confirm.')
          resolve()
        }
        const promises = []
        for (const name of list) {
          promises.push(this.loadComponent(name))
        }
        Promise.allSettled(promises).then((result) => {
          resolve()
        })
      })()
    })
  }

  loadComponent (name) {
    return new Promise((resolve, reject) => {
      const dir = path.join(__dirname, '..', 'components', name)
      const cPath = path.join(dir, 'index.js')
      const configPath = path.join(dir, 'config.js')
      var config = _require(configPath)
      if (!config) {
        console.warn('Invalid config:', name)
        console.warn(`Component:${name} will be instanced without configuration.`)
        config = {}
      }

      if (config.disabled) {
        console.info(`Component '${name}' will not be loaded because 'disabled' is set.`)
        reject(new Error('disabled:true'))
        return
      }

      var Klass = _require(cPath)
      if (!Klass) {
        console.warn('Fails to find component:', name)
        console.warn(Klass)
        console.warn(`Component:${name} will not be loaded.`)
        reject(Klass)
        return
      }
      var component = new Klass(config)
      if (component instanceof Error) {
        console.warn('Fails to load component:', name)
        console.warn(component.message)
        console.info(`Component ${name} will not be loaded.`)
        reject(component)
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
        resolve()
      }
    })
  }

  scanComponents () {
    return new Promise((resolve, reject) => {
      var cPath = path.join(__dirname, '..', 'components')
      var r = fs.readdirSync(cPath, { withFileTypes: true })
        .filter((dirent) => {
          return dirent.isDirectory()
        })
        .map((dirent) => {
          return dirent.name
        })
        .filter((name) => {
          return /^[a-z0-9]/i.test(name)
        })
      resolve(r)
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
    const scanCustomElement = (component) => {
      return new Promise((resolve, reject) => {
        var cPath = path.join(component.dir, 'elements')
        try {
          const r = fs.readdirSync(cPath, { withFileTypes: true })
            .filter((dirent) => {
              return dirent.isFile()
            })
            .map((dirent) => {
              return dirent.name
            })
            .filter((name) => {
              return /^mz-[0-9a-zA-Z-_]*\.js$/i.test(name)
            })
          for (const file of r) {
            const e = file.substring(0, file.length - 3)
            if (!ce.find((item) => {
              return (item.name === e)
            })) {
              var el = (component.elements[e]) ? component.elements[e] : null
              ce.push({
                name: e,
                path: path.join(component.dir, 'elements', file),
                url: component.url + '/elements/' + file,
                origin: component.id,
                config: (el && el.config) ? el.config : null,
                template: (el && el.template) ? el.template : null,
                _config: (el) || null
              })
              resolve()
            } else {
              console.warn(`Custom Element '${component.id}.${e}' seems duplicated. It will be ignored.'`)
            }
          }
        } catch (e) {
          console.warn(e.message)
          console.info('There is no element to scan in component:', component.id)
          resolve()
        }
      })
    }

    return new Promise((resolve, reject) => {
      var promises = []
      for (var component of this.components) {
        promises.push(scanCustomElement(component))
      }
      Promise.allSettled(promises).then(() => {
        resolve(ce)
      })
    })
  }

  allInjects (type) {
    var method = ''
    var message = ''
    var key = null
    if (type === 'style') {
      method = 'injectStyles'
      message = 'Stylesheet'
      key = '_styles'
    } else if (type === 'script') {
      method = 'injectScripts'
      message = 'Script'
      key = '_scripts'
    } else if (type === 'module') {
      method = 'injectModuleScripts'
      message = 'Module-Script'
      key = '_moduleScripts'
    } else {
      console.warn('Invalid injection type:', type)
      return
    }
    var is = []
    for (var component of this.components) {
      var cis = (component.customOverride[key])
        ? component.customOverride[key]
        : component[method]()
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

  prepareClient () {
    return new Promise((resolve, reject) => {
      try {
        this.allCustomElements().then((r) => {
          this.clientPrepares = {
            // listId: this.listId(),
            scripts: this.allInjects('script'),
            styles: this.allInjects('style'),
            modules: this.allInjects('module'),
            elements: r
          }
          resolve()
        }).catch(reject)
      } catch (e) {
        reject(e)
      }
    })
  }

  getClientFeed () {
    return this.clientPrepares
  }

  messageToComponent (mObj) {
    return new Promise((resolve, reject) => {
      mObj.message = mObj.message.payload
      var c = this.findById(mObj._component)
      if (c) {
        resolve(c.onClientMessage(mObj))
      } else {
        reject(new Error('Invalid Component'))
      }
    })
  }

  export () {
    return {
      listComponents: () => { return this.list() },
      listComponentId: () => { return this.listId() },
      findComponentById: (id) => { return this.findById(id) },
      broadcastComponentMessage: (message) => {},
      sendComponentMessage: (targetModule, message) => {},
      sendMessageToClient: (from, to, message) => {
        Clients.sendMessageToClient(from, to, message)
      }
    }
  }
}

var Components = new _Components()

module.exports = Components
