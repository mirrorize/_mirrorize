/* global HTMLElement, MZ */

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

    this.displayLock = new Set()
    this.config = MZ.getStorage(this.mzTagName, 'config')
    this.bindTo = MZ.getStorage(this.mzTagName, 'originComponent')
    if (!this.config) this.config = {}

    this.init()

    if (this.isShadow) {
      this.attachShadow({ mode: 'open' })
    }
    this.onConstructed()
  }

  /* Implement in Child */
  init () {}

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
    return ['disabled', 'hidden']
  }

  attributeChangedCallback (name, oldValue, newValue) {
    /*
    if (oldValue !== newValue) {
      if (name == 'disabled') {}
      if (name == 'hidden') {}
    }
    */
    this.onAttributeChanged(name, oldValue, newValue)
  }

  /* Implement in Child */
  onAttributeChanged (name, oldValue, newValue) {}

  connectedCallback () {
    var tmpl = this.getTemplate()
    if (tmpl && tmpl.trim()) {
      var dom = this.getDOM()
      const template = document.createElement('template')
      template.innerHTML = tmpl
      dom.appendChild(template.content.cloneNode(true))
    }
    this.setAttribute('uid', this.uid)
    this.setAttribute('tag_name', this.mzTagName)
    this.setAttribute('customElement', '')
    // MZ.registerElement(this)
    this.render()
    this.onConnected()
    this._beforeHiddenDisplayState = window.getComputedStyle(this, null).getPropertyValue('display')
    // this.start()
  }

  /* Implement in Child */
  onConnected () {}

  disconnectedCallback () {
    // MZ.unregisterElement(this)
    this.onDisconnected()
  }

  /* Implement in Child */
  onDisconnected () {}

  /* Implement in Child */
  updateDOM (dom) {}

  render () {
    this.updateDOM(this.getDOM())
  }

  getTemplate () {
    /* Should implement */
    return null
  }

  getStyle () {
    /* Should implement */
    return null
  }

  getStylesheet () {
    return null
  }

  getDOM () {
    return (this.shadowRoot) ? this.shadowRoot : this
  }

  /* is this used? */
  mergeConfig (config) {
    this.config = Object.assign({}, this.config, config)
  }

  show (lock = null) {
    return new Promise((resolve, reject) => {
      if (!this.hidable) resolve(this.hidable)
      this.displayLock.delete(lock)
      if (this.displayLock.size === 0) {
        if (this.style.display === 'none') {
          this.dataset.status = 'show'
          this.style.opacity = 0
          this.style.display = this._beforeHiddenDisplayState
          this.style.transition = 'opacity 1s ease-in-out'
          this.style.opacity = 1
          this.ontransitionend = () => {
            this.style.removeProperty('transition')
            this.style.removeProperty('opacity')
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

  hide (lock = null) {
    return new Promise((resolve, reject) => {
      if (!this.hidable) resolve(this.hidable)
      if (lock) this.displayLock.add(lock)
      if (this.style.display !== 'none') {
        this.dataset.status = 'hide'
        this._beforeHiddenDisplayState = window.getComputedStyle(this, null).getPropertyValue('display')
        this.style.transition = 'opacity 1s ease-in-out'
        this.style.opacity = 0
        this.ontransitionend = () => {
          this.style.display = 'none'
          this.style.removeProperty('transition')
          this.style.removeProperty('opacity')
          resolve()
        }
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
