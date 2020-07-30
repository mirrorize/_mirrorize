/* global CustomElement */
const template = `
<style>
:host {
  position: relative;
  width: fit-content;
}

#id {
  width: fit-content;
}

.notify-item {
  margin: 5px 0;
  position:relative;
  background-color:#FFF;
  border-radius: 5px;
  font-size: 0.3em;
  color: black;
  padding: 10px;
  overflow: hidden;
  opacity:0;
  transition:
    transform 2s ease-out,
    opacity 2s ease-out;
}

.right .notify-item {
  transform: translateX(100%);
}

.left .notify-item {
  transform: translateX(-100%);
}

.slideOut {
  opacity: 0;
  transition:
    transform 2s ease-out,
    opacity 2s ease-out;
}

.right .slideOut {
  transform: translateX(100%);
}

.left .slideOut {
  transform: translateX(-100%);
}

.slideIn {
  opacity: 1;
  transition:
    transform 2s ease-out,
    opacity 2s ease-out;
}

.right .slideIn {
  transform: translateX(0);
}

.left .slideIn {
  transform: translateX(0);
}



.log {
  background-color: #99F;
}
.info {
  background-color: #9F9;
}
.warn {
  background-color: #FF9;
}
.error {
  background-color: #F99;
}
.title {
  font-weight: bold;
}

</style>
<div id="content"></div>
`
export default class extends CustomElement {
  get isShadow () {
    return true
  }

  init () {
    this.default = {
      timer: (this.config.timer) ? this.config.timer : 5000,
      position: (this.config.position) ? this.config.position : 'bottom right',
      type: 'log'
    }
  }

  getTemplate () {
    return template.trim()
  }

  onConnected () {
    this.show()
  }

  show () {
    const {
      timer = this.default.timer,
      type = this.default.type,
      title = 'NOTIFY',
      content = '',
      position = this.default.position
    } = this.dataset
    var dom = this.getDOM().querySelector('#content')
    dom.classList.add(...position.split(' '))
    var ni = document.createElement('div')
    ni.classList.add('notify-item', type)
    var t = document.createElement('div')
    t.classList.add('title')
    t.innerHTML = title
    var c = document.createElement('div')
    c.classList.add('content')
    c.innerHTML = content
    ni.appendChild(t)
    ni.appendChild(c)
    dom.appendChild(ni)
    setTimeout(() => {
      ni.classList.add('slideIn')
      setTimeout(() => {
        ni.classList.add('slideOut')
        ni.classList.remove('slideIn')
        ni.ontransitionend = () => {
          if (typeof this.callback === 'function') {
            this.callback()
          }
          ni.ontransitionend = null
          this.remove()
        }
      }, timer)
    }, 100)
  }
}
