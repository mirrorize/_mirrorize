const Log = require('./logger.js')('COMPONENTS')
// const Translate = require('./translate.js')
const path = require('path')
const fs = require('fs')
const Socket = require('./socket.js')

function _require (required) {
  try {
    if (fs.existsSync(required)) {
      var r = require(required)
      return r
    } else {
      Log.warn('File not found:', required)
      return null
    }
  } catch (e) {
    Log.warn(`${required} has some issue to load.`)
    Log.warn(e)
    return null
  }
}

function _scanAllFiles (cPath, pattern) {
  var r = fs.readdirSync(cPath, { withFileTypes: true })
    .filter((dirent) => {
      return dirent.isFile()
    })
    .map((dirent) => {
      return dirent.name
    })
    .filter((name) => {
      return pattern.test(name)
    })
  if (!Array.isArray(r)) r = []
  return r
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
          Log.warn('There is no component to load. This would not be the error but you need to confirm.')
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
      try {
        const dir = path.join(__dirname, '..', 'components', name)
        const cPath = path.join(dir, 'index.js')
        const configPath = path.join(dir, 'config.js')
        var config = _require(configPath)
        if (!config) {
          Log.warn(`Component '${name}' will be instanced without configuration.`)
          config = {}
        }

        if (config.disabled) {
          Log.info(`Component '${name}' will not be loaded because 'disabled' is set.`)
          reject(new Error('disabled:true'))
          return
        }
        // var t = Object.assign({}, config.config)
        config.config = Object.assign({}, this.config.common, config.config)
        var Klass = _require(cPath)
        if (!Klass) {
          Log.warn('Fails to find component:', name)
          Log.warn(Klass)
          Log.warn(`Component:${name} will not be loaded.`)
          reject(Klass)
          return
        }
        var component = new Klass(config)
        if (component instanceof Error) {
          Log.warn('Fails to load component:', name)
          Log.warn(component.message)
          Log.info(`Component ${name} will not be loaded.`)
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
            Log.info(`Component '${name}' is constructed.`)
            component.onConstructed()
            resolve()
          }).catch((e) => {
            Log.error(e)
            Log.info('Fail to load component:', name)
            reject(e)
          })
        }
      } catch (e) {
        Log.warn('Fail to load components.')
        Log.error(e)
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

  start () {
    return new Promise((resolve) => {
      Log.info('Each component will be starting')
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

  onClientReady (clientUID, clientName) {
    return new Promise((resolve) => {
      var promises = []
      this.components.forEach((component, i) => {
        promises.push(component.onClientReady(clientUID, clientName))
      })
      Promise.allSettled(promises).then(resolve)
    })
  }

  onClientDisconnected (clientUID) {
    return new Promise((resolve) => {
      var promises = []
      this.components.forEach((component, i) => {
        promises.push(component.onClientDisconnected(clientUID))
      })
      Promise.allSettled(promises).then(resolve)
    })
  }

  clientAssets () {
    return new Promise((resolve, reject) => {
      try {
        (async () => {
          var assets = {}
          assets.styles = await this.allInjections('css', 'css', 'injectStyles')
          assets.scripts = await this.allInjections('js', 'js', 'injectScripts')
          assets.templates = await this.allInjections('templates', 'html', 'injectTemplates')
          assets.elements = await this.allElementsInjections('elements', 'js', 'injectElements')
          resolve(assets)
        })()
      } catch (e) {
        Log.warn('Fail to prepare Client Assets')
        reject(e)
      }
    })
  }

  allElementsInjections (dirName, ext, componentMethod) {
    var ce = []
    const scanCustomElement = (component) => {
      return new Promise((resolve, reject) => {
        var cPath = path.join(component.dir, 'public', 'elements')
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
            const e = file.split('.').shift()
            if (!ce.find((item) => {
              return (item.name === e)
            })) {
              var el = (component.elements[e]) || {}
              var cfg = null
              if (!el.config) el.config = {}
              if (el.config) {
                cfg = Object.assign({}, this.config.common, el.config)
              }
              ce.push({
                name: e,
                path: path.join(component.dir, 'public', 'elements', file),
                url: component.url + '/public/elements/' + file,
                origin: component.name,
                config: cfg,
                _config: (el) || null // ??? I cannot remember what it was. maybe original configuration.
              })
              resolve()
            } else {
              Log.warn(`Custom Element '${component.name}.${e}' seems duplicated. It will be ignored.'`)
              resolve()
            }
          }
          resolve()
        } catch (e) {
          Log.warn(e.message)
          Log.info(`Component '${component.name}' has no custom element`)
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

  allInjections (dirName, ext, componentMethod) {
    return new Promise((resolve, reject) => {
      var result = []
      var tPath = path.join('public', dirName)
      for (var component of this.components) {
        var dir = path.join(component.dir, tPath)
        var url = path.join(component.url, tPath)
        var aResult = _scanAllFiles(dir, new RegExp(`^[^_].+${ext}$`, 'i')).map((file) => {
          return path.join(url, file)
        })
        var eResult = (typeof component[componentMethod] === 'function') ? component[componentMethod]() : []
        result = [...result, ...aResult, ...eResult]
      }
      resolve(result)
    })
  }

  getComponentByName (name) {
    return this.components.find((c) => {
      return (c.name === name)
    })
  }

  export () {
    return {
      getComponentByName: this.getComponentByName.bind(this),
      listComponents: this.list.bind(this),
      listComponentName: this.listName.bind(this)
    }
  }
}

var Components = new _Components()

module.exports = Components
