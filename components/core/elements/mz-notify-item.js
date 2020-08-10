/* global CustomElement */

const template = `
<style>
:host {
  display: block;
  position: relative;
  width: fit-content;
}
#container {
  display: grid;
  width: fit-content;
  position:relative;
  font-size: 0.5em;
  color: #CCC;
  padding: 10px;
  padding-right: 20px;
  overflow: hidden;
  box-shadow: 5px 5px 5px 5px rgba(0,0,0,0.5);
  grid-template-columns: minmax(0, auto) minmax(120px, auto);
  grid-template-rows: minmax(0, auto) minmax(0, auto);
  grid-template-areas:
    "icon title"
    "icon content";
  grid-gap: 10px;
}

.top {
  margin-top: 10px;
  margin-bottom: 0;
}

.bottom {
  margin-bottom: 10px;
  margin-top: 0;
}
.right {
  margin-right:0;
  transform: translateX(100%);
}

.left {
  margin-left:0;
  transform: translateX(-100%);
}

.log {
  background-color: #339;
}
.info {
  background-color: #393;
}
.warn {
  background-color: #993;
}
.error {
  background-color: #933;
}
.title {
  font-weight: bold;
  display:block;
  font-size: 1.2em;
  color: #FFF;
  grid-area: title;
}
.content {
  grid-area: content;
  background-color:#999;

}
.icon {
  display: block;
  font-size: 30px;
  grid-area: icon;
  color: #FFF;
  margin: auto;
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
