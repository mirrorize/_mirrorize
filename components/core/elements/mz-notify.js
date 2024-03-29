/* global CustomElement MutationObserver */
const template = `
<style>
.notify {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.notify .container {
  position: absolute;
  height: 50%;
  width:50%;
  display:none;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  display: hidden;
}

.notify .container.top {
  top: 0;
}

.notify .container.left {
  left: 0;
}

.notify .container.bottom {
  bottom: 0;
  flex-direction: column-reverse;
}

.notify .container.right {
  right: 0;
  align-items: flex-end;
}

</style>
<div class="notify" part="notify">
  <div class="container top left"></div>
  <div class="container top right"></div>
  <div class="container bottom left"></div>
  <div class="container bottom right"></div>
</div>
`

var singleton = false

export default class extends CustomElement {
  get isShadow () {
    return true
  }

  init () {
    if (singleton === true) {
      console.error('This module should not be instanced multiply.')
    }
    singleton = true
    var defaults = window.MZ.getStorage('mz-notify', 'config')
    this.timer = (defaults.timer) ? defaults.timer : 5000
    this.type = (defaults.type) ? defaults.type : 'log'
    this.position = (defaults.position) ? defaults.position : 'top left'
  }

  getTemplate () {
    return template.trim()
  }

  onConnected () {
    window.MZ.notify = (obj) => {
      this.notify(obj)
    }
    const checkParent = (dom) => {
      var allHidden = Array.from(dom.querySelectorAll('.container')).every((child) => {
        return (window.getComputedStyle(child).getPropertyValue('display') === 'none')
      })
      if (allHidden) {
        this.style.display = 'none'
      } else {
        this.style.display = 'block'
      }
    }
    this.observers = []
    var dom = this.getDOM()
    var cons = dom.querySelectorAll('.container')
    for (const c of cons) {
      const observer = new MutationObserver((mutations, ob) => {
        const m = mutations[0]
        const self = m.target
        if (m.type === 'childList') {
          if (self.innerHTML.trim() !== '') {
            self.style.display = 'flex'
            self.dataset.status = 'working'
          } else {
            self.style.display = 'none'
            self.dataset.status = 'resting'
          }
          checkParent(dom)
        }
      })
      observer.observe(c, { childList: true })
      this.observers.push(observer)
    }
  }

  onDisconnected () {
    for (const ob of this.observers) {
      ob.disconnect()
    }
    this.observers = []
  }

  notify (obj) {
    var dom = this.getDOM()
    var n = document.createElement('mz-notify-item')
    n.dataset.timer = (obj.timer) ? obj.timer : this.timer
    n.dataset.type = (obj.type) ? obj.type : this.type
    n.dataset.position = (obj.position) ? obj.position : this.position
    n.dataset.position = n.dataset.position.trim()
    if (obj.title) n.dataset.title = obj.title
    if (obj.content) n.dataset.content = obj.content
    if (obj.callback) n.callback = obj.callback
    var pos = '.' + n.dataset.position.replace(' ', '.')
    var query = `.notify .container${pos}`
    dom.querySelector(query).appendChild(n)
  }

  /*
  removeNotify (n) {
    var dom = this.getDOM()
    dom.removeChild(n)
  }
  */
}
