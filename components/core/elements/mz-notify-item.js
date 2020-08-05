/* global CustomElement */

const template = `
<style>
:host {
  display: block;
  position: relative;
  width: fit-content;
}
#container {
  display: block;
  width: fit-content;
  color: black;
  margin: 15px 15px;
  position:relative;
  border-radius: 10px;
  font-size: 0.5em;
  color: black;
  padding: 10px;
  overflow: hidden;
  box-shadow: 5px 5px 5px 5px rgba(0,0,0,0.5);
  font-family: "Courier New";
}
.right {
  transform: translateX(100%);
}

.left {
  transform: translateX(-100%);
}

.log {
  background-color: #33F;
}
.info {
  background-color: #3F3;
}
.warn {
  background-color: #FF3;
}
.error {
  background-color: #F33;
}
.title {
  font-weight: bold;
  display:inline-block;
  font-size: 1.2em;
}
.icon {
  display: inline-block;
  font-size: 1.2em;
}
</style>
<div id="container" class="container" part="mz-notify-item">
  <slot id="icon" class="icon" name="icon" part="mz-notify-item-icon"></slot>
  <slot id="title" class="title" name="title" part="mz-notify-item-title"></slot>
  <slot id="content" class="content" name="content" part="mz-notify-item-content"></slot>
</div>
`
export default class extends CustomElement {
  get isShadow () {
    return true
  }

  onDisconnected () {
    this.callback = null
  }

  defaultContent () {
    return template
  }

  onReady () {
    this.exportChildrenParts()
    var { timer, type, position } = this.dataset
    var self = this.contentDom.querySelector('#container')
    self.classList.add(type)
    position.split(' ').forEach((pos, i) => {
      self.classList.add(pos)
    })

    if (this.styleOverride) {
      var style = document.createElement('style')
      style.innerHTML = this.styleOverride
      this.contentDom.appendChild(style)
    }

    var transform = (self.classList.contains('left')) ? 'translateX(-100%)' : 'translateX(100%)'

    const showAnimation = {
      opacity: [0, 1],
      transform: [transform, 'translateX(0%)']
    }

    const hideAnimation = {
      opacity: [1, 0],
      transform: ['translateX(0%)', transform]
    }

    const timing = {
      duration: 2000,
      fill: 'forwards'
    }

    var ani = self.animate(showAnimation, timing)
    ani.onfinish = () => {
      setTimeout(() => {
        var end = self.animate(hideAnimation, timing)
        end.onfinish = () => {
          if (typeof this.callback === 'function') this.callback()
          this.parentNode.removeChild(this)
        }
      }, timer)
    }
  }
}
