const path = require('path')
const fs = require('fs')
// const Clients = require('./clients.js')
const Socket = require('./socket.js')

function _require (required) {
  try {
    if (fs.existsSync(required)) {
      var r = require(required)
      return r
    } else {
      console.warn('File not found:', required)
    }
  } catch (e) {
    console.warn(`${required} has some issue to load.`)
    console.warn(e.message)
    return null
  }
}

class _Components {
  constructor () {
    this.components = []
    this.messenger = null
  }

  init (_config = {}, messenger) {
    this.config = _config
    this.clientPrepares = null
    this.messenger = messenger
    return new Promise((resolve, reject) => {
      (async () => {
        var list = await this.scanComponents()
        if (!Array.isArray(list) || list.length <= 0) {
          console.warn('There is no component to load. This would not be the error but you need to confirm.')
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

  getMessenger () {
    return this.messenger
  }

  loadComponent (name) {
    return new Promise((resolve, reject) => {
      try {
        const dir = path.join(__dirname, '..', 'components', name)
        const cPath = path.join(dir, 'index.js')
        const configPath = path.join(dir, 'config.js')
        var config = _require(configPath)
        if (!config) {
          console.warn(`Component '${name}' will be instanced without configuration.`)
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
          Socket.getClientMessenger('/').then((messenger) => {
            component.messenger = messenger
            component.messenger.joinRoom('COMPONENT')
            component.messenger.joinRoom(`COMPONENT(NAME:${name})`)
            component.messenger.onMessage(component.onMessage.bind(component))
            this.components.push(component)
            component.onConstructed()
            console.info(`Component '${name}' is constructed.`)
            resolve()
          }).catch((e) => {
            console.error(e)
            console.info('Fail to load component:', name)
            reject(e)
          })
        }
      } catch (e) {
        console.warn('Fail to load components.')
        console.error(e)
        reject(e)
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

  staticRoutes (component) {
    var ret = []
    var list = component.staticRoutes()
    if (!Array.isArray(list)) list = []
    list.push('public')
    list.push('elements')
    for (const p of list) {
      var r = null
      var d = null
      if (typeof p === 'string') {
        r = path.join(component.url, p)
        d = path.join(component.dir, p)
      } else if (typeof p === 'object' && p.route && p.dir) {
        r = p.route
        d = p.dir
      } else {
        continue
      }
      if (fs.existsSync(d)) {
        ret.push({
          route: r,
          dir: d
        })
      } else {
        continue
      }
    }
    return ret
  }

  list () {
    return this.components
  }

  /*
  findById (id) {
    return this.components.find((c) => {
      return (c.id === id)
    })
  }
  */
  start () {
    console.log('Components start')
    return new Promise((resolve) => {
      for (const component of this.components) {
        component.start()
      }
      resolve()
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

  listName () {
    var r = this.components.map((component) => {
      return component.name
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
                origin: component.name,
                config: (el && el.config) ? el.config : null,
                template: (el && el.template) ? el.template : null,
                _config: (el) || null
              })
              resolve()
            } else {
              console.warn(`Custom Element '${component.name}.${e}' seems duplicated. It will be ignored.'`)
            }
          }
        } catch (e) {
          // console.warn(e.message)
          console.info(`Component '${component.name}' has no custom element`)
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
            console.warn(`${message} to inject '${s}' of '${component.name}' seems duplicated. It will be ignored.'`)
          }
        }
      }
    }
    return is
  }

  onClientReady ({ clientUID, clientName }) {
    return new Promise((resolve) => {
      var promises = []
      this.components.forEach((component, i) => {
        promises.push(component.onClientReady(clientUID, clientName))
      })
      Promise.allSettled(promises).then(resolve)
    })
  }

  onClientDisconnected ({ clientUID, clientName }) {
    return new Promise((resolve) => {
      var promises = []
      this.components.forEach((component, i) => {
        promises.push(component.onClientDisconnected(clientUID, clientName))
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

  /*
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
  */

  export () {
    return {
      // getMessenger: this.getMessenger.bind(this),
      listComponents: this.list.bind(this),
      listComponentName: this.listName.bind(this)
      // findComponentById: this.findById.bind(this)
      /*
      broadcastComponentMessage: (message) => {},
      sendComponentMessage: (targetModule, message) => {},
      sendMessageToClient: (from, to, message) => {
        Clients.sendMessageToClient(from, to, message)
      }
      */
    }
  }
}

var Components = new _Components()

module.exports = Components
