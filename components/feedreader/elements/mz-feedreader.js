/* global CustomElement */
const template = `
<style>
:host {
  text-align:center;
  display:flex;
  justify-content: center;
  align-items: center;
}

#self {
  text-align:center;
  width: 100%;
}

.summary {
  color: gray;
  font-size: 0.35em;
}

.title {
  color: white;
  font-size: 0.5em;
  font-weight: bold;
}



</style>
<div id="self" part="content">
  <div class="title" part="title" data-bind="title"></div>
  <div class="summary" part="summary" data-bind="summary" data-truncate="400" data-escapehtml="true"></div>
</div>
`

export default class extends CustomElement {
  init () {
    this.items = []
  }

  get isSahdow () {
    return true
  }

  get hidable () {
    return true
  }

  static observableAttributes () {
    return ['duration']
  }

  onAttributeChanged (name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue
      this.work()
    }
  }

  getTemplate () {
    this.refresh = (this.config.refresh) ? this.config.refresh : 1000 * 60
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
      this.items = ret.message
      this.work()
    })
  }

  work () {
    console.log(this.config)
    const escapeHtml = (unsafe) => {
      return unsafe.replace(/<[^>]*>?/gm, ' ').replace('Continue reading...', '')
    }
    clearTimeout(this.timer)
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
    if (this.items.length <= 0) {
      this.requestFeeds()
      return
    }
    this.hide().then(() => {
      var item = this.items.shift()
      var targets = this.getDOM().querySelectorAll('[data-bind]')
      var ts = [...targets]
      for (const t of ts) {
        const bind = t.dataset.bind
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
          t.innerHTML = content
        }
      }
      this.show()
    })
    this.timer = setTimeout(() => {
      console.log('duration', duration)
      this.work()
    }, duration)
  }
}
