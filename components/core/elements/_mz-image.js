/* global CustomElement */

const style = `
:host {
  text-align:center;
  position:relative;
  overflow: hidden;
}
#contentDom {
  overflow:hidden;
  position: relative;
  width:100%;
  height:100%;
}

#background {
  width: 100%;
  height: 100%;
  position: relative;
}

#mainImage {
  width:100%;
  height:100%;
  object-fit: contain;
  position: absolute;
  top:0;
  left:0;
}

.glassbg {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(8px) grayscale(80%) brightness(50%) opacity(75%);
}
`

export default class extends CustomElement {
  get isShadow () {
    return true
  }

  get hidable () {
    return true
  }

  static observableAttributes () {
    return ['src', 'refreshinterval', 'width', 'height', 'autoseed', 'objectfit']
  }

  onAttributeChanged (name, oldValue, newValue) {
    if (name === 'width') {
      this.contentDom.style.width = newValue
    }
    if (name === 'height') {
      this.contentDom.style.height = newValue
    }
    this.draw()
  }

  defaultStyle () {
    return style
  }

  onReady () {
    this.timer = null
    this.draw()
  }

  draw () {
    clearTimeout(this.timer)
    this._draw().then(() => {
      var refresh = this.getAttribute('refreshinterval')
      if (refresh) {
        this.timer = setTimeout(() => {
          this.draw()
        }, refresh)
      }
    })
  }

  getSrc (src) {
    src = src || this.getAttribute('src')
    if (this.hasAttribute('autoseed')) {
      var rand = '_as_' + Date.now()
      if (src.indexOf('&') <= 0) {
        src += '?'
      } else {
        src += '&'
      }
      src += rand
    }
    return src
  }

  changeImage (src = null) {
    return new Promise((resolve) => {
      src = this.getSrc(src)
      if (!src) return
      this.contentDom.innerHTML = ''
      var img = document.createElement('img')
      img.id = 'mainImage'
      img.setAttribute('part', 'mainImage')
      var bg = document.createElement('div')
      bg.id = 'background'
      bg.setAttribute('part', 'background')
      if (this.getAttribute('objectfit') === 'contain-glassbg') {
        img.style.objectFit = 'contain'
        bg.classList.add('glassbg')
        bg.style.backgroundImage = `url(${src})`
      } else {
        img.style.objectFit = this.getAttribute('objectfit') || 'scale-down'
      }
      img.onload = () => {
        img.style.opacity = 1
        resolve()
      }
      img.onerror = (e) => {
        console.warn('Image loading error', e)
        img.style.opacity = 0
        resolve(e)
      }
      img.src = src
      this.contentDom.appendChild(bg)
      this.contentDom.appendChild(img)
    })
  }

  hideImage (option = {}) {
    var {
      animation = {
        opacity: [1, 0]
      },
      duration = 1000
    } = option
    return new Promise((resolve) => {
      var ani = this.contentDom.animate(animation, duration)
      ani.onfinish = () => {
        this.contentDom.style.opacity = 0
        resolve()
      }
      ani.onerror = (e) => {
        this.contentDom.style.opacity = 0
        resolve(e)
      }
    })
  }

  showImage (option = {}) {
    var {
      animation = {
        opacity: [0, 1]
      },
      duration = 500
    } = option
    return new Promise((resolve) => {
      var ani = this.contentDom.animate(animation, duration)
      ani.onfinish = () => {
        this.contentDom.style.opacity = 1
        resolve()
      }
      ani.onerror = (e) => {
        this.contentDom.style.opacity = 1
        resolve(e)
      }
    })
  }

  _draw () {
    return new Promise((resolve, reject) => {
      if (!this.isReady) return
      this.hideImage().then((e) => {
        this.changeImage(this.getAttribute('src')).then((e) => {
          this.showImage().then((e) => {
            resolve()
          })
        })
      })
    })
  }
}
