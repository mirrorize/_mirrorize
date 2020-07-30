/* global CustomElement */
const template = `
<style>
:host {
  text-align:center;
}

#self {
  display: grid;
  column-gap: 5px;
  row-gap: 5px;
  width: 100%;
  background-color: black;
  overflow: hidden;
  font-size: 60%;
}
#title {
  grid-area: title;
  font-weight: bold;
  color: white;
}

#photo {
  display:none;
  grid-area: photo;
}

#content {
  grid-area: content;
  font-size: 50%;
  text-align: left;
}
#source {
  grid-area: source;
  font-size: 40%;
  text-align: left;
  font-weight: bold;
}
#date {
  grid-area: date;
  font-size: 40%;
  text-align: right;
}


#self.vertical {
  grid-template-columns: 1fr 1fr;
  grid-template:
    "title title" 1fr
    "photo photo" min-content
    "content content" 3fr
    "source date" auto
}

#self.horizontal {
  grid-template-columns: min-content 1fr 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "photo title title"
    "photo content content"
    "photo source date";
}

.horizontal #photo {
  width: 200px;
}

</style>
<div id="self">
  <div id="title" part="title" data-bind="title"></div>
  <mz-image id="photo" src="//:0" data-bind="imageurl" bgglass fit="contain"></mz-image>
  <div id="content" part="content" data-bind="content" data-escapehtml="true"></div>
  <div id="source" part="source" data-bind="name"></div>
  <div id="date" part="date" data-bind="date" data-timeformat="MMM D. HH:mm"></div>
</div>
`

export default class extends CustomElement {
  init () {
    this.items = []
    this.disptype = 'horizontal'
  }

  get isShadow () {
    return true
  }

  get hidable () {
    return true
  }

  get resizeObservable () {
    return true
  }

  static observableAttributes () {
    return ['duration', 'disptype']
  }

  onAttributeChanged (name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue
    }
  }

  getTemplate () {
    return template.trim()
  }

  onConnected () {
    this.timer = null
    this.work()
  }

  requestFeeds () {
    var source = (this.source)
      ? this.source
      : ((this.config.source) ? this.config.source : null)
    var msg = {
      key: 'REQUEST_ITEM'
    }
    if (source) msg.source = source
    this.sendMessageToComponent(msg, (ret) => {
      console.log('sen')
      this.items = ret.message
      if (this.items.length <= 0) {
        setTimeout(() => {
          this.work()
        }, 30000)
      } else {
        this.work()
      }
    })
  }

  drawContent () {
    const escapeHtml = (unsafe) => {
      return unsafe.replace(/<[^>]*>?/gm, ' ').replace('Continue reading...', '')
    }
    return new Promise((resolve, reject) => {
      var dom = this.getDOM()
      dom.innerHTML = "oops" + new Date()
      resolve()
      dom.querySelector('#self').className = this.disptype
      var item = this.items.shift()
      var targets = dom.querySelectorAll('[data-bind]')
      var ts = [...targets]
      for (const t of ts) {
        const bind = t.dataset.bind
        if (t.tagName === 'MZ-IMAGE') {
          if (item[bind]) {
            t.setAttribute('src', item[bind])
            t.show()
          } else {
            t.hide()
            t.removeAttribute('src')
          }
        } else if (t.tagName === 'IMG') {
          if (item[bind]) {
            t.setAttribute('src', item[bind])
            t.style.display = 'block'
          } else {
            t.setAttribute('src', 'none')
            t.style.display = 'none'
          }
        } else {
          t.innerHTML = ''
          if (item[bind]) {
            var content = (t.dataset.escapehtml === 'true') ? escapeHtml(item[bind]) : item[bind]
            var truncate = (t.dataset.truncate)
              ? t.dataset.truncate
              : (
                (this.truncate)
                  ? this.truncate
                  : (
                    (this.config.truncate)
                      ? this.config.truncate
                      : 0
                  )
              )
            if (truncate > 0) {
              if (content.length > truncate) {
                content = content.substring(0, truncate) + '...'
              }
            }
            if (t.dataset.timeformat) {
              content = moment(content).format(t.dataset.timeformat)
            }
          }
          t.innerHTML = content
        }
      }
      resolve()
    })
  }

  work () {
    clearTimeout(this.timer)
    if (this.items.length <= 0) {
      this.requestFeeds()
      return
    }

    var duration = (this.getAttribute('duration'))
      ? this.getAttribute('duration')
      : (
        (this.duration)
          ? this.duration
          : (
            (this.config.duration)
              ? this.config.duration
              : 5000
          )
      )
    this.hide().then(() => {
      this.drawContent().then(() => {
        this.show()
      })
    })

    this.timer = setTimeout(() => {
      this.work()
    }, duration)
  }

  show (lock = null) {
    console.log('show!')
    return new Promise((resolve, reject) => {
      if (!this.hidable) resolve(this.hidable)
      this.displayLock.delete(lock)
      if (this.displayLock.size === 0) {
        if (this.style.display === 'none') {
          this.style.opacity = 0
          this.style.display = this._beforeHiddenDisplayState
          this.ontransitionend = () => {
            this.ontransitionend = null
            this.style.removeProperty('transition')
            console.log('show transition end')
            resolve()
          }
          this.style.transition = 'opacity 2s ease-in-out'
          this.style.opacity = 1
        } else {
          resolve()
        }
      } else {
        resolve()
      }
    })
  }

  hide (lock = null) {
    console.log('hide!')
    return new Promise((resolve, reject) => {
      if (!this.hidable) resolve(this.hidable)
      if (lock) this.displayLock.add(lock)
      if (this.style.display !== 'none') {
        this._beforeHiddenDisplayState = window.getComputedStyle(this, null).getPropertyValue('display')
        this.ontransitionend = () => {
          this.ontransitionend = null
          this.style.display = 'none'
          this.style.removeProperty('transition')
          console.log('hide transition end')
          resolve()
        }
        this.style.transition = 'opacity 2s ease-in-out'
        console.log('hide transition start')
        this.style.opacity = 0
      } else {
        resolve()
      }
    })
  }
}
