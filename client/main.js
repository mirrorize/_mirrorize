/* global fetch DOMParser */
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
    this.storage = {}
    this.injectedScripts = null
    this.injectedStyles = null
    this.injectedModules = null
    this.customElements = []
    this.connectedElements = null
    this.styles = ['/_/common.css']
    this.messageSession = []

    import('/_client/config.js').then((module) => {
      this.config = module.default
    }).catch((e) => {
      console.error(e)
    })
    fetch('/_client/template.html').then((response) => {
      return response.text()
    }).then((html) => {
      var parser = new DOMParser()
      var doc = parser.parseFromString(html, 'text/html')
      var body = doc.querySelector('template#body').content
      document.body.appendChild(body.cloneNode(true))
    }).catch((err) => {
      console.error(err)
      console.warn('Invalid template file. No content for body will be loaded.')
    })

    this.start()
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
    this.socket = new Socket(this.clientUID, {
      protocol: this.protocol,
      address: this.address,
      port: this.port
    }, this.messageHandler.bind(this))
    this.socket.connect(this.firstOpened.bind(this), this.onSocketConnected.bind(this))
  }

  onSocketConnected () {
    if (this.isAlreadyPrepared) {
      console.info('Socket is reconnected but initialization is finished so ignored.')
      return false
    }
    this.sendMessage({
      message: {
        key: 'SOCKET_OPENED',
        payload: this.wsURL
      }
    }, (msg) => {
      if (msg._reply && msg.original.key === 'SOCKET_OPENED') {
        (async () => {
          // await this.createCSP(this.injectedScripts) /* reserved */
          await this.injectModules(msg.message.modules)
          await this.injectScripts(msg.message.scripts)
          await this.loadCustomElements(msg.message.elements)
          await this.injectStyles(this.styles)
          await this.injectStyles(msg.message.styles)
          await this.readyCustomElements()
          this._isMZReady = true
          this.sendMessage({
            message: {
              key: 'CLIENT_PREPARED'
            }
          }, () => {
            this.isAlreadyPrepared = true
          })
        })()
      }
    })
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

  messageHandler (msg) {
    const { message, _element = null, _tagname = null, _MZ = null } = msg
    if (!message) return
    const { key, payload = null } = message
    if (key === 'TO_CLIENT') {
      var ces = [...document.querySelectorAll('[mzcustomelement]')]
      var targets = []
      if (_MZ) {
        // for mirrorize client itself... will it be needed???
      } else if (_element) {
        targets = ces.filter((ce) => { return _element === ce.uid })
      } else if (_tagname) {
        targets = ces.filter((ce) => { return _tagname === ce.mzTagName })
      }
      targets.forEach((target, i) => {
        if (typeof target.onMessage === 'function') target.onMessage(payload)
      })
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
    const loadElement = (name, url, config, origin) => {
      return new Promise((resolve, reject) => {
        import(url).then((module) => {
          window.customElements.define(name, module.default)
          console.info('CustomElement loaded:', name, url)
          this.customElements.push({
            name: name,
            url: url,
            origin: origin
          })
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
        for (const { name, url, config, origin } of elements) {
          promises.push(loadElement(name, url, config, origin))
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

  getCustomElementOrigin (name) {
    var r = this.customElements.find((ce) => {
      return ce.name === name
    })
    if (r) return r.origin
    return null
  }

  /* ???? */
  registerElement (el) {
    this.connectedElements[el.uid] = el.mzTagName
  }

  unregisterElement (el) {
    this.connectedElements[el.uid] = null
    delete this.connectedElements[el.uid]
  }

  sendMessage (message, callback) {
    this.socket.sendMessage(message, callback)
  }

  getClientId () {
    return this.config.id
  }

  isMZReady () {
    return this._isMZReady
  }
}

const mz = new _MZ()
window.MZ = {
  config: mz.config,
  isMZReady: mz.isMZReady.bind(mz),
  getCustomElementOrigin: mz.getCustomElementOrigin.bind(mz),
  getStorage: mz.getStorage.bind(mz),
  setStorage: mz.setStorage.bind(mz),
  sendMessage: mz.sendMessage.bind(mz),
  getClientId: mz.getClientId.bind(mz)
}
export default mz
