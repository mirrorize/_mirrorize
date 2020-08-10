/* global fetch MZ */
import Socket from './_/socket.mjs'
import CustomElement from './_/customelement.mjs'

window.CustomElement = CustomElement

class _MZ {
  constructor () {
    const getParams = (url) => {
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
    this.onReadyJobs = []
    this.protocol = window.location.protocol
    this.address = window.location.hostname
    this.port = window.location.port
    this.serverURL = `${this.protocol}://${this.address}:${this.port}`
    var params = getParams(window.location.href)
    this.clientName = (params.client) ? params.client : 'default'
    this.clientUID = this.clientName + '_' + Date.now()
    this._isMZReady = false
    this.isAlreadyConnected = false
    this.isAlreadyPrepared = false
    this.storage = new Map()
    this.injectedScripts = null
    this.injectedStyles = null
    this.injectedModules = null
    this.customElements = []
    this.connectedElements = null
    this.styles = ['/_/common.css', '/_client/main.css']
    this.socket = new Socket()

    import('/_client/config.js').then((module) => {
      this.config = module.default
    }).catch((e) => {
      console.warn('There could be some issue on config.js')
      console.error(e)
    })
    this.start()
  }

  prepareTemplates () {
    fetch('/_client/template.html').then((response) => {
      return response.text()
    }).then((html) => {
      this.templates = document.createRange().createContextualFragment(html)
      var body = this.getTemplate('body')
      if (body) {
        document.body.appendChild(body)
      } else {
        console.warn('Invalid template file. No content for body will be loaded.')
      }
    }).catch((err) => {
      console.error(err)
      console.warn('Invalid template file. No content for body will be loaded.')
    })
  }

  getTemplate (selector) {
    try {
      return this.templates.querySelector('template#' + selector).content.cloneNode(true)
    } catch (e) {
      console.warn(e)
      return null
    }
  }

  getConfig () {
    return this.config
  }

  setStorage (key, data) {
    this.storage.set(key, data)
  }

  getStorage (key) {
    return this.storage.get(key)
  }

  /*
  getClientSocket (nsp) {
    return this.socket.getClientSocket(nsp)
  }
  */

  start () {
    console.info('Client starts.', this.clientName, this.clientUID)
    const socketNotify = (type, msg) => {
      if (MZ.notify) {
        MZ.notify({
          title: '[SOCKET] ' + msg.message,
          type: type,
          position: 'bottom right',
          timer: 5000
        })
      }
      console.warn(type, msg.message)
    }
    const on = {
      disconnect: function () {
        this.leaveRoom('CLIENT')
        this.leaveRoom(`CLIENT(UID:${this.clientUID})`)
        this.leaveRoom(`CLIENT(NAME:${this.clientName})`)
        socketNotify('error', { message: 'Disconnected from Server.' })
      },
      error: function (error) {
        socketNotify('error', error)
      },
      connect_error: function (error) {
        if (error.message === 'xhr poll error') error.message = 'Retry connection, but failed'
        socketNotify('error', error)
      },
      reconnect: function () {
        socketNotify('info', { message: 'Reconnected to Server.' })
      }
    }
    this.socket.getClientMessenger('/', on).then((messenger) => {
      this.messenger = messenger
      messenger.registerClient(this.clientUID)
      messenger.joinRoom('CLIENT')
      messenger.joinRoom(`CLIENT(UID:${this.clientUID})`)
      messenger.joinRoom(`CLIENT(NAME:${this.clientName})`)
      messenger.onMessage(this.messageHandler.bind(this))
      messenger.socket.on('_DATA', (key, data) => {
        this.storage.set(key, data)
      })
      messenger.sendMessage('SERVER', {
        message: 'REQUEST_BROWSER_ASSETS',
        clientUID: this.clientUID,
        clientName: this.clientName
      }, (ret) => {
        if (!this.isAlreadyPrepared) {
          this.prepareBrowser(ret).then(() => {
            messenger.sendMessage('SERVER', {
              message: 'BROWSER_PREPARED',
              clientUID: this.clientUID,
              clientName: this.clientName
            })
          })
        }
      })
    })
  }

  messageHandler (msgObj, fn) {}

  prepareBrowser (data) {
    return new Promise((resolve, reject) => {
      (async () => {
        // await this.createCSP(this.injectedScripts) // reserved
        await this.injectStyles(data.styles)
        await this.injectStyles(this.styles)
        await this.injectScripts(data.scripts)
        await this.injectModules(data.modules)
        await this.loadCustomElements(data.elements)
        this.prepareTemplates()
        this._isMZReady = true
        console.info('MZ is ready.')
        await this.doOnReadyJob()
        await this.readyCustomElements()
        this.isAlreadyPrepared = true
        resolve()
      })()
    })
  }

  doOnReadyJob () {
    while (this.onReadyJobs.length > 0) {
      var cb = this.onReadyJobs.pop()
      if (typeof cb === 'function') cb()
    }
  }

  registerOnReadyJob (callback) {
    if (typeof callback === 'function') this.onReadyJobs.push(callback)
  }

  readyCustomElements () {
    return new Promise((resolve, reject) => {
      var targets = document.querySelectorAll('[mzcustomelement]')
      for (const t of [...targets]) {
        if (typeof t._MZReady === 'function') t._MZReady()
      }
      resolve()
    })
  }

  firstOpened () {
    if (this.isAlreadyConnected) {
      window.location.reload()
      return true
    } else {
      this.isAlreadyConnected = true
      return false
    }
  }

  /* this method is not completed. */
  /*
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
  */

  injectStyles (styles) {
    const injectStyle = (script) => {
      return new Promise((resolve, reject) => {
        try {
          var id = null
          var src = null
          if (typeof script === 'object' && script.src) {
            id = (script.id) ? script.id : null
            src = (script.src) ? script.src : null
          } else {
            src = script
          }
          if (!src) {
            console.info('Invalid src:', script)
            reject(new Error('Invalid src'))
            return
          }
          var load = document.createElement('link')
          if (id) load.setAttribute('id', id)
          load.setAttribute('type', 'text/css')
          load.setAttribute('rel', 'stylesheet')
          load.setAttribute('href', src)
          document.getElementsByTagName('head')[0].appendChild(load)
          console.info('Stylesheet loaded:', src)
          resolve()
        } catch (e) {
          console.warn('Stylesheet failed to load:', src)
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
          var id = null
          var src = null
          if (typeof script === 'object' && script.src) {
            id = (script.id) ? script.id : null
            src = (script.src) ? script.src : null
          } else {
            src = script
          }
          if (!src) {
            console.info('Invalid src:', script)
            reject(new Error('Invalid src'))
          }
          var load = document.createElement('script')
          if (id) load.setAttribute('id', id)
          load.setAttribute('src', src)
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
            const { ...rest } = module
            for (const [key, value] of Object.entries(rest)) {
              if (Object.prototype.hasOwnProperty.call(MZ, key)) {
                console.warn(`Identifier '${key}'' of module-script is already registered:`, script)
              } else {
                MZ[key] = value
              }
            }
            console.info('Module-Script loaded:', script)
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
    const loadElement = (el) => {
      return new Promise((resolve, reject) => {
        const { name, url } = el
        import(url).then((module) => {
          window.customElements.define(name, module.default)
          this.customElements.push(el)
          module.default._onLoaded(el)
          console.info('CustomElement loaded:', name, url)
          resolve()
        }).catch((e) => {
          // console.warn(e)
          console.warn('CustomElement loading failed:', name, url)
          console.error(e)
          resolve()
        })
      })
    }
    return new Promise((resolve, reject) => {
      try {
        if (!elements || !Array.isArray(elements) || elements.length < 1) resolve()
        var promises = []
        for (const el of elements) {
          promises.push(loadElement(el))
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

  getCustomElementDefinition (name) {
    return this.customElements.find((ce) => {
      return ce.name === name
    })
  }

  getCustomConfig (name) {
    if (this.config.customConfig) {
      return (this.config.customConfig[name]) ? this.config.customConfig[name] : null
    }
    return null
  }

  getClientUID () {
    return this.clientUID
  }

  getClientName () {
    return this.clientName
  }

  /* ???? */
  registerElement (el) {
    this.connectedElements[el.uid] = el.mzTagName
  }

  unregisterElement (el) {
    this.connectedElements[el.uid] = null
    delete this.connectedElements[el.uid]
  }

  isMZReady () {
    return this._isMZReady
  }
}

const mz = new _MZ()
window.MZ = {
  registerOnReadyJob: mz.registerOnReadyJob.bind(mz),
  getTemplate: mz.getTemplate.bind(mz),
  getCustomConfig: mz.getCustomConfig.bind(mz),
  isMZReady: mz.isMZReady.bind(mz),
  getCustomElementDefinition: mz.getCustomElementDefinition.bind(mz),
  getStorage: mz.getStorage.bind(mz),
  setStorage: mz.setStorage.bind(mz),
  getClientUID: mz.getClientUID.bind(mz),
  getClientName: mz.getClientName.bind(mz)
}
export default mz
