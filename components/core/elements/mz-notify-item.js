/* global CustomElement */

const template = `
<style>
:host {
  display: block;
  position: relative;
  width: fit-content;
}

#self {
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
}


#self.right {
  transform: translateX(100%);
}

#self.left {
  transform: translateX(-100%);
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
  display:inline-block;
  font-size: 1.2em;
}

.icon {
  display: inline-block;
  font-size: 1.2em;
}

</style>
<div id="self">
  <slot class="icon" name="icon"></slot>
  <slot class="title" name="title"></slot>
  <slot class="content" name="content"></slot>
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
    var { timer, type, position } = this.dataset
    var self = this.contentDom.querySelector('#self')
    self.classList.add(type)
    position.split(' ').forEach((pos, i) => {
      self.classList.add(pos)
    })

    const showAnimation = {
      opacity: [0, 1],
      transform: ['translateX(0%)']
    }

    var transform = (self.classList.contains('left')) ? 'translateX(-100%)' : 'translateX(100%)'

    const hideAnimation = {
      opacity: [1, 0],
      transform: [transform]
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
