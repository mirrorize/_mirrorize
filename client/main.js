import Socket from './socket.mjs'
import CustomElement from './customelement.mjs'

window.CustomElement = CustomElement

const protocol = window.location.protocol
const address = window.location.hostname
const port = window.location.port
const serverURL = `${protocol}://${address}:${port}`

class _MZ {
  constructor () {
    var params = this.getParams(window.location.href)
    var configPath = (params.config) ? params.config : 'config'
    try {
      console.info('Loading configuration:', configPath)
      import('/_/config/' + configPath).then((config) => {
        if (!config || !config.default || !config.default.client) {
          console.log('?')
          throw new Error('Invalid Client Configuration')
        }
        this.config = config.default.client
        this.module = {}
        this.serverURL = serverURL
        this.isAlreadyConnected = false
        this.storage = {}
        this.injectedScripts = null
        this.injectedStyles = null
        this.injectedModules = null
        this.customElements = null
        this.connectedElements = null
        this.styles = [
          '/_/main.css',
          '/_/custom.css'
        ]
        this.start()
      }).catch((e) => {
        console.error('Invalid Client Configuration')
        console.error(e)
      })
    } catch (e) {
      console.error('Invalid Client Configuration')
      console.error(e)
    }
  }

  getParams (url) {
    var params = {}
    var parser = document.createElement('a')
    parser.href = url
    var query = parser.search.substring(1)
    var vars = query.split('&')
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=')
      params[pair[0]] = decodeURIComponent(pair[1])
    }
    return params
  }

  setStorage (key, particle, data) {
    if (!Object.prototype.hasOwnProperty.call(this.storage, key)) {
      this.storage[key] = {}
    }
    this.storage[key][particle] = data
  }

  getStorage (key, particle) {
    if (!Object.prototype.hasOwnProperty.call(this.storage, key)) return null
    if (!Object.prototype.hasOwnProperty.call(this.storage[key], particle)) return null
    return this.storage[key][particle]
  }

  start () {
    this.socket = new Socket(this.config.id, {
      protocol: this.config.protocol,
      address: this.config.address,
      port: this.config.port
    }, this.messageHandler.bind(this))
    this.socket.connect(this.reconnectCheck.bind(this))
  }

  reconnectCheck () {
    if (this.isAlreadyConnected) {
      window.location.reload()
      return false
    } else {
      this.isAlreadyConnected = true
      return true
    }
  }

  messageHandler (msg) {
    if (msg.message === 'LOAD_INJECTED_SCRIPTS') {
      this.injectedScripts = msg.body
    }
    if (msg.message === 'LOAD_INJECTED_STYLES') {
      this.injectedStyles = msg.body
    }
    if (msg.message === 'LOAD_INJECTED_MODULES') {
      this.injectedModules = msg.body
    }
    if (msg.message === 'LOAD_CUSTOMELEMENTS') {
      this.customElements = msg.body
    }
    if (
      this.serverURL && this.injectedStyles &&
      this.injectedScripts && this.injectedModules &&
      this.customElements && !this.isAlreadyPrepared
    ) {
      const job = async () => {
        // await this.createCSP(this.injectedScripts) /* reserved */
        await this.injectModules(this.injectedModules)
        await this.injectScripts(this.injectedScripts)
        await this.loadCustomElements(this.customElements)
        await this.injectStyles(this.styles)
        await this.injectStyles(this.injectedStyles)
        this.socket.sendMessage('CLIENT_PREPARED')
      }
      job()
    }
  }

  /* this method is not completed. */
  createCSP (scripts) {
    return new Promise((resolve) => {
      const tmpl = [
        "default-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        'img-src *',
        'media-src *',
        "script-src 'self' 'unsafe-inline' blob: "
      ]
      const whiteDomains = scripts.map((s) => {
        const url = new URL(s.url)
        return url.origin
      })
      var white = [...new Set(whiteDomains)]
      var str = tmpl.join('; ')
      str += white.join(' ')
      str += ';'
      var csp = document.querySelector('head #csp')
      if (csp) csp.setAttribute('content', str)
      resolve()
    })
  }

  injectStyles (styles) {
    const injectStyle = (url) => {
      return new Promise((resolve, reject) => {
        try {
          var load = document.createElement('link')
          load.setAttribute('type', 'text/css')
          load.setAttribute('rel', 'stylesheet')
          load.setAttribute('href', url)
          document.getElementsByTagName('head')[0].appendChild(load)
          console.info('Stylesheet loaded:', url)
          resolve()
        } catch (e) {
          console.warn('Stylesheet failed to load:', url)
          reject(e)
        }
      })
    }
    return new Promise((resolve) => {
      var promises = []
      for (var s of styles) {
        promises.push(injectStyle(s))
      }
      Promise.allSettled(promises).then(() => {
        console.info('All Styles are loaded.')
        resolve()
      })
    })
  }

  injectScripts (scripts) {
    const loadScripts = (sA) => {
      return new Promise((resolve, reject) => {
        if (Array.isArray(sA) && sA.length >= 1) {
          const script = sA.shift()
          var load = document.createElement('script')
          load.setAttribute('src', script)
          load.setAttribute('charset', 'UTF-8')
          load.setAttribute('defer', '')
          document.getElementsByTagName('head')[0].appendChild(load)
          load.onload = () => {
            console.info('Script loaded:', script)
            resolve(loadScripts(sA))
          }
          load.onerror = (e) => {
            console.info('Script failed to load:', script)
            reject(e)
          }
        } else {
          resolve()
        }
      })
    }
    return new Promise((resolve) => {
      var sArray = [...scripts]
      loadScripts(sArray).then(() => {
        console.info('All Scripts are loaded.')
        resolve()
      })
    })
  }

  injectModules (modules) {
    const loadScripts = (sA) => {
      return new Promise((resolve, reject) => {
        if (Array.isArray(sA) && sA.length >= 1) {
          const script = sA.shift()
          import(script).then((module) => {
            const { onLoaded = () => {}, ...rest } = module
            for (const [key, value] of Object.entries(rest)) {
              if (Object.prototype.hasOwnProperty.call(this, key)) {
                console.warn(`Identifier '${key}'' of module-script is already registered:`, script)
              } else {
                this[key] = value
              }
            }
            console.info('Module-Script loaded:', script)
            if (typeof onLoaded === 'function') {
              onLoaded()
            }

            resolve(loadScripts(sA))
          }).catch((e) => {
            console.warn('Module-Script failed to load:', script)
            reject(e)
          })
        } else {
          resolve()
        }
      })
    }
    return new Promise((resolve) => {
      var sArray = [...modules]
      loadScripts(sArray).then(() => {
        console.info('All Module-Scripts are loaded.')
        resolve()
      })
    })
  }

  loadCustomElements (elements) {
    const loadElement = (name, url, config) => {
      return new Promise((resolve, reject) => {
        import(url).then((module) => {
          this.setStorage(name, 'config', config)
          window.customElements.define(name, module.default)
          console.info('CustomElement loaded:', name, url)
          resolve()
        }).catch((e) => {
          console.warn(e)
          console.warn('CustomElement loading failed:', name, url)
          resolve()
        })
      })
    }
    return new Promise((resolve, reject) => {
      try {
        if (!elements || !Array.isArray(elements) || elements.length < 1) resolve()
        var promises = []
        for (const { name, url, config } of elements) {
          promises.push(loadElement(name, url, config))
        }
        Promise.allSettled(promises).then(() => {
          console.info('All customElements are loaded.')
          resolve()
        })
      } catch (e) {
        console.warn(e)
        reject(e)
      }
    })
  }

  registerElement (el) {
    this.connectedElements[el.uid] = el.mzTagName
  }

  unregisterElement (el) {
    this.connectedElements[el.uid] = null
    delete this.connectedElements[el.uid]
  }
}

const mz = new _MZ()
window.MZ = {
  getStorage: mz.getStorage.bind(mz),
  setStorage: mz.setStorage.bind(mz)
}
export default mz
