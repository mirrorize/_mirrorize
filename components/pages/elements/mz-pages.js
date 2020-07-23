/* global CustomElement */
export default class MZPage extends CustomElement {
  init () {
    this.interval = (this.config.interval) ? this.config.interval : 0
    this.rotation = (this.config.rotation) ? this.config.rotation : ''
    this.start_page = (this.config.start_page) ? this.config.start_page : null
  }

  static observableAttributes () {
    return ['interval', 'rotation', 'start_page']
  }

  onAttributeChanged (name, oldValue, newValue) {
    if (oldValue === newValue) return
    if (!MZPage.observableAttributes().includes(name)) return
    this[name] = newValue
  }

  start () {
    console.log('start!')
    this.timer = null
    this.job({
      interval: this.interval,
      rotation: this.rotation,
      current: this.start_page
    })
  }

  onDisconnected () {
    clearTimeout(this.timer)
  }

  job (obj) {
    clearTimeout(this.timer)
    const rotation = obj.rotation.split(' ')
    if (rotation.length < 1) return
    var current = obj.current
    console.log(current)
    var targets = [...document.querySelectorAll('[pages]')]
    targets.forEach((elm, i) => {
      var pages = elm.getAttribute('pages').split(' ')
      if (pages.includes(current)) {
        if (typeof elm.show === 'function') {
          elm.show(this.uid)
        }
      } else {
        if (typeof elm.hide === 'function') {
          elm.hide(this.uid)
        }
      }
    })
    var cIndex = (rotation.includes(current)) ? rotation.indexOf(current) : 0
    obj.current = (cIndex >= rotation.length - 1) ? rotation[0] : rotation[cIndex + 1]
    setTimeout(() => {
      this.job(obj)
    }, obj.interval)
  }
}
