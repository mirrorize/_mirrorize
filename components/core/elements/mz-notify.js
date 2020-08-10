/* global CustomElement MutationObserver MZ */

const defTemplate = `
<style>
:host {
  display: block;
}
.notify {
  position: absolute;
  z-index: 9999;
}

.notify .container {
  position: fixed;
  display:none;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  display: hidden;
  z-index: 9999;
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

mz-notify-item.error::part(mz-notify-item-title) {
  color: white;
}


</style>
<div class="notify">
  <div class="container top left"></div>
  <div class="container top right"></div>
  <div class="container bottom left"></div>
  <div class="container bottom right"></div>
</div>
`

export default class extends CustomElement {
  get isShadow () {
    return true
  }

  get hidable () {
    return false
  }

  defaultContent () {
    return defTemplate
  }

  get socketable () {
    return true
  }


  onReady () {
    this.setAttribute('exportparts', 'mz-notify-item, mz-notify-item-icon, mz-notify-item-title, mz-notify-item-content')
    this.default = {
      timer: (this.config.timer) ? this.config.timer : 5000,
      position: (this.config.position) ? this.config.position : 'top left',
      type: (this.config.type) ? this.config.type : 'log',
      className: (this.config.className) ? this.config.className : '',
      icon: (this.config.icon) ? this.config.icon : '',
      title: (this.config.title) ? this.config.title : 'NOTIFY',
      content: (this.config.content) ? this.config.content : ''
    }
    window.MZ.notify = (obj) => {
      this.notify(obj)
    }
    const checkContainer = (dom) => {
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
    var dom = this.contentDom
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
          checkContainer(dom)
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

  onMessage (data, reply) {
    console.log(data)
    if (typeof reply === 'function') {
      reply('ok')
    }
  }

  notify (obj) {
    /*
    {
      timer,
      type,
      position,
      icon,
      title,
      content,
      callback,
      styleOverride
    }
    */
    var dom = this.contentDom
    var n = document.createElement('mz-notify-item')
    n.dataset.timer = (obj.timer) ? obj.timer : this.default.timer
    n.dataset.type = (obj.type) ? obj.type : this.default.type
    n.dataset.position = (obj.position) ? obj.position : this.default.position
    n.dataset.position = n.dataset.position.trim()
    var r = ['icon', 'title', 'content']
    for (const t of r) {
      var s = document.createElement('div')
      s.setAttribute('slot', t)
      s.innerHTML = (obj[t]) ? obj[t] : this.default[t]
      n.appendChild(s)
    }
    if (obj.callback) n.callback = obj.callback
    if (obj.styleOverride) n.styleOverride = obj.styleOverride
    var pos = '.' + n.dataset.position.replace(' ', '.')
    var query = `.notify .container${pos}`
    dom.querySelector(query).appendChild(n)
    if (MZ.flushIconify) MZ.flushIconify(n)
  }
}
