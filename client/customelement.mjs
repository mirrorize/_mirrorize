/* global HTMLElement, MZ, customElements Element */

var uids = 1
const _getCurrentStyle = (item) => {
  return window.getComputedStyle(item)
}

class CustomElement extends HTMLElement {
  // static uids = 1
  static getClassName () {
    return this.name
  }

  static onLoaded (definition) {}
  static _onLoaded (definition) {
    this.onLoaded()
  }

  defaultStyle () {
    return ''
  }

  defaultContent () {
    return ''
  }

  get contentDom () {
    /*
    var query = '.mzShadowContentDom'
    return (this.isShadow) ? this.shadowRoot.querySelector(query) : this
    */
    return (this.shadowRoot) ? this.shadowRoot : this
  }

  get isShadow () {
    return false
  }

  get hidable () {
    return false
  }

  get shadowMode () {
    return 'open'
  }

  get reconfigurable () {
    return false
  }

  get importedShadowCSS () {
    return null
  }

  // false : you need to draw initial content with .defaultContent() or render by yourself sometime.
  get templateCustomizable () {
    return true
  }

  constructor () {
    super()
    this.displayLock = new Set()
    Object.defineProperty(this, 'uid', {
      value: 'MZ_' + uids++,
      writable: false
    })
    Object.defineProperty(this, 'mzTagName', {
      value: this.tagName.toLowerCase(),
      writable: false
    })
    customElements.whenDefined(this.mzTagName).then(() => {
      this._definedCallback()
    })
    var definition = MZ.getCustomElementDefinition(this.mzTagName)
    this.config = (definition.config) ? (definition.config) : {}
    if (this.reconfigurable) {
      var reconf = this.getAttribute('config')
      var newConfig = MZ.getCustomConfig(reconf)
      if (newConfig) this.reconfig(newConfig)
    }
    if (this.getAttribute('bind')) {
      this.bindTo = this.getAttribute('bind')
    } else {
      this.bindTo = definition.origin
    }

    if (this.isShadow) {
      this.attachShadow({ mode: this.shadowMode })
    }

    var template = null
    if (!this.shadowRoot && this.innerHTML.trim() !== '') {
      // do nothing;
    } else {
      if (this.templateCustomizable) {
        var overrideTemplateId = this.getAttribute('template')
        var ot = null
        if (overrideTemplateId && (ot = MZ.getTemplate(overrideTemplateId))) {
          template = ot
        } else if (definition.template) {
          template = document.createRange().createContextualFragment(definition.template)
        }
      }
      if (!template) {
        const _getDefaultContent = () => {
          var r = this.defaultContent()
          if (typeof r === 'object' && r instanceof Element) {
            return r
          }
          if (typeof r === 'string') {
            return document.createRange().createContextualFragment(r)
          }
          return null
        }
        template = _getDefaultContent()
      }
    }
    if (template) this.contentDom.appendChild(template)
    if (this.shadowRoot) {
      var imp = this.importedShadowCSS
      if (imp) {
        var style = document.createElement('style')
        style.innerHTML = `@import url("${imp}");`
        this.contentDom.appendChild(style)
      }
    }
    Object.defineProperty(this, 'isConstructed', {
      value: true,
      writable: false
    })
    if (MZ.isMZReady()) this._MZReady()
    this.onConstructed()
  }

  _definedCallback () {
    if (this.isDefined) return
    Object.defineProperty(this, 'isDefined', {
      value: true,
      writable: false
    })
    this.onDefined()
    this._ready()
  }

  onDefined () {}

  _MZReady () { // Check whether is already MZ ready before constructed or connected.
    if (this.isMZReady) return
    Object.defineProperty(this, 'isMZReady', {
      value: true,
      writable: false
    })
    this._ready()
  }

  _ready () {
    if (this.isDefined && this.isConnected && this.isMZReady && !this.isReady) {
      Object.defineProperty(this, 'isReady', {
        value: true,
        writable: false
      })
      this.onReady()
    }
  }

  onMessage (data, reply) {
    console.info(`Element ${this.mzTagName}:${this.uid} get message.`)
    if (typeof reply === 'function') reply(null)
  }

  onConstructed () {}

  static get observedAttributes () {
    var parent = CustomElement.observableAttributes()
    var child = this.observableAttributes()
    return [...new Set([...parent, ...child])]
  }

  /* Implement in Child */
  static observableAttributes () {
    if (this.reconfigurable) {
      return ['config', 'bind']
    } else {
      return ['bind']
    }
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'bind') this.bindTo = newValue
    if (name === 'config') {
      var newConfig = MZ.getCustomConfig(newValue)
      this.reconfig(newConfig)
    }
    this.onAttributeChanged(name, oldValue, newValue)
  }

  reconfig (newConfig = null) {
    if (this.reconfigurable) {
      if (newConfig) this.config = newConfig
    }
  }

  /* Implement in Child */
  onAttributeChanged (name, oldValue, newValue) {}

  connectedCallback () {
    this.setAttribute('uid', this.uid)
    this.setAttribute('tagname', this.mzTagName)
    this.setAttribute('mzcustomelement', '')
    this.onConnected()
    this._previousDispType = _getCurrentStyle(this).getPropertyValue('display')
    if (MZ.isMZReady()) this._MZReady()
    this._ready()
  }

  onReady () {
    console.log(`${this.mzTagName} is ready.`)
  }

  /* Implement in Child */
  onConnected () {}

  disconnectedCallback () {
    this.onDisconnected()
  }

  /* Implement in Child */
  onDisconnected () {}

  show (lock = null, option = {}) {
    return new Promise((resolve, reject) => {
      if (!this.hidable) {
        resolve(this.hidable)
        return
      }
      var {
        animation = {
          opacity: [0, 1]
        },
        timing = {
          duration: 1000,
          easing: 'ease-in-out'
        }
      } = option
      var cs = _getCurrentStyle(this)
      this.displayLock.delete(lock)
      if (this.displayLock.size === 0) {
        if (cs.getPropertyValue('display') === 'none') {
          this.style.display = this._previousDispType
          var ani = this.animate(animation, timing)
          ani.onfinish = () => {
            this.style.cssText = ''
            resolve()
          }
        } else {
          resolve()
        }
      } else {
        resolve()
      }
    })
  }

  hide (lock = null, option = {}) {
    return new Promise((resolve, reject) => {
      if (!this.hidable) {
        resolve(this.hidable)
        return
      }
      var {
        animation = {
          opacity: [1, 0]
        },
        timing = {
          duration: 1000,
          easing: 'ease-in-out'
        }
      } = option
      var cs = _getCurrentStyle(this)
      if (lock) this.displayLock.add(lock)
      if (cs.getPropertyValue('display') !== 'none') {
        this._previousDispType = cs.getPropertyValue('display')
        this.style.display = this._previousDispType
        var ani = this.animate(animation, timing)
        ani.onfinish = () => {
          this.style.display = 'none'
          resolve()
        }
      } else {
        resolve()
      }
    })
  }

  exportChildrenParts () {
    if (this.shadowRoot) {
      var all = this.contentDom.querySelectorAll('[part]')
      var exportparts = [...all].map((d) => { return d.getAttribute('part') }).join(', ')
      if (exportparts) this.setAttribute('exportparts', exportparts)
    }
  }

  sendMessage (to, msgObj, reply) {
    MZ.sendMessage(to, msgObj, reply)
  }
}

export default CustomElement
