/* global HTMLElement, MZ, customElements, CSSStyleSheet */
const defTemplate = `
<div mces id="contentDom"></div>
`
var uids = 1
class CustomElement extends HTMLElement {
  // static uids = 1

  constructor () {
    super()
    Object.defineProperty(this, 'uid', {
      value: uids++,
      writable: false
    })
    Object.defineProperty(this, 'mzTagName', {
      value: this.tagName.toLowerCase(),
      writable: false
    })
    customElements.whenDefined(this.mzTagName).then(() => {
      this._definedCallback()
    })

    this.displayLock = new Set()
    const temp = document.createElement('template')
    temp.innerHTML = defTemplate.trim()
    var self = temp.content.cloneNode(true)
    var cd = null
    if (this.isShadow) {
      this.attachShadow({ mode: 'open' })
      this.shadowRoot.appendChild(self)
      cd = this.shadowRoot.querySelector('[mces]')
    } else {
      this.appendChild(self)
      cd = this.querySelector('[mces]')
    }
    cd.setAttribute('mces', this.uid)

    if (this.ishidable) {}

    Object.defineProperty(this, 'isConstructed', {
      value: true,
      writable: false
    })
    if (window.MZ.isMZReady()) this._MZReady()
    this.onConstructed()
  }

  get contentDom () {
    var id = `[mces="${this.uid}"]`
    return (this.isShadow) ? this.shadowRoot.querySelector(id) : this.querySelector(id)
  }

  /* Implement in Child */
  init () {}

  _definedCallback () {
    Object.defineProperty(this, 'isDefined', {
      value: true,
      writable: false
    })
    this.onDefined()
    this._ready()
  }

  onDefined () {
    this.bindTo = MZ.getCustomElementOrigin(this.mzTagName)
  }

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

  onConstructed () {}

  get isShadow () {
    return false
  }

  get hidable () {
    return false
  }

  static get observedAttributes () {
    var parent = CustomElement.observableAttributes()
    var child = this.observableAttributes()
    return [...new Set([...parent, ...child])]
  }

  /* Implement in Child */
  static observableAttributes () {
    return []
  }

  attributeChangedCallback (name, oldValue, newValue) {
    this.onAttributeChanged(name, oldValue, newValue)
  }

  /* Implement in Child */
  onAttributeChanged (name, oldValue, newValue) {}

  connectedCallback () {
    this.setAttribute('uid', this.uid)
    this.setAttribute('tagname', this.mzTagName)
    this.setAttribute('mzcustomelement', '')
    this.onConnected()
    this._previousDispType = this._getCurrentStyle().getPropertyValue('display')
    if (window.MZ.isMZReady()) this._MZReady()
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

  /* Implement in Child */
  _getCurrentStyle () {
    return window.getComputedStyle(this)
  }

  show (lock = null, option = {}) {
    var {
      animation = {
        opacity: [0, 1]
      },
      duration = 1000
    } = option
    var cs = this._getCurrentStyle()
    return new Promise((resolve, reject) => {
      if (!this.hidable) {
        resolve(this.hidable)
        return
      }
      this.displayLock.delete(lock)
      if (this.displayLock.size === 0) {
        if (cs.getPropertyValue('display') === 'none') {
          this.style.display = this._previousDispType
          var ani = this.contentDom.animate(animation, duration)
          ani.onfinish = () => {
            resolve()
          }
          /*
          const showend = () => {
            this.contentDom.removeEventListener('animationend', showend)
            this.style.opacity = 1
            resolve()
          }
          this.contentDom.addEventListener('animationend', showend)
          this.contentDom.style.animationDuration = duration + 'ms'
          this.contentDom.style.animationName = 'fadeIn'
          this.style.opacity = 0
          this.style.display = this._previousDispType
          */
        } else {
          resolve()
        }
      } else {
        resolve()
      }
    })
  }

  hide (lock = null, option = {}) {
    var {
      animation = {
        opacity: [1, 0]
      },
      duration = 1000
    } = option
    var cs = this._getCurrentStyle()
    return new Promise((resolve, reject) => {
      if (!this.hidable) {
        resolve(this.hidable)
        return
      }
      if (lock) this.displayLock.add(lock)
      if (cs.getPropertyValue('display') !== 'none') {
        this._previousDispType = cs.getPropertyValue('display')
        this.style.display = this._previousDispType
        var ani = this.contentDom.animate(animation, duration)
        ani.onfinish = () => {
          this.style.display = 'none'
          resolve()
        }
        /*
        const hideend = () => {
          this.contentDom.removeEventListener('animationend', hideend)
          this.style.display = 'none'
          resolve()
        }
        this.contentDom.addEventListener('animationend', hideend)
        this.contentDom.style.animationDuration = duration + 'ms'
        this.contentDom.style.animationName = 'fadeOut'
        */
      } else {
        resolve()
      }
    })
  }

  sendMessage (message, callback, bindTo = this.bindTo) {
    var msg = {
      message: message,
      _element: this.uid,
      _tagname: this.mzTagName,
      _component: bindTo
    }
    var c = (typeof callback === 'function') ? callback.bind(this) : null
    MZ.sendMessage(msg, c)
  }

  sendMessageToComponent (payload, callback, bindTo = this.bindTo) {
    var msg = {
      key: 'TO_COMPONENT',
      payload: payload
    }
    this.sendMessage(msg, callback, bindTo)
  }

  onMessage (msg) {
    console.log('>', msg)
  }

  /*
  start () {
    console.log(this.mzTagName, 'is starting')
  }
  */
}

export default CustomElement
