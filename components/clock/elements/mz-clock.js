/* global CustomElement moment */

const template = `
<style>
:host {
  color: grey;
  padding: 10px;
  vertical-align: middle;
  text-align: center;
  position:relative;
  display:flex;
  justify-content: center;
  align-items: center;
  background-color:#123;
}

.time {
  font-weight: bold;
  color: white;
  font-size: 100%;
}

.second {
  font-size:50%;
  vertical-align: top;
}

.date {
  font-size: 40%;
  color: gray;
}

.weeks {
  display:none;
}

.content {
}

</style>

<div part="content" class="content">
  <div part="date" class="date">
    <mz-clock-particle format="dddd," class="weekday" part="weekday"></mz-clock-particle>
    <mz-clock-particle format="LL" class="wholedate" part="wholedate"></mz-clock-particle>
  </div>
  <div part="time" class="time">
    <mz-clock-particle format="HH:mm" class="hour minute" part="hour minute"></mz-clock-particle><mz-clock-particle format="ss" part="second" class="second"></mz-clock-particle>
  </div>
</div>
`

export default class extends CustomElement {
  init () {

  }

  static observableAttributes () {
    return ['locale', 'timezone', 'dynamicsize']
  }

  onAttributeChanged (name, oldValue, newValue) {
    if (name === 'locale') {
      this.locale = newValue
    }
    if (name === 'timezone') {
      this.timezone = newValue
    }
    if (name === 'dynamicsize') {
      this.dynamicsize = newValue
    }
  }

  getTemplate () {
    return (this.config.template) ? this.config.template.trim() : template.trim()
  }

  onDisconnected () {
    clearTimeout(this.timer)
  }

  onConnected () {
    this.locale = (this.config.locale) ? this.config.locale : moment.locale()
    this.dynamicsize = (this.config.dynamicsize) ? this.config.dynamicsize : 0
    this.timezone = (this.config.timezone)
      ? this.config.timezone
      : Intl.DateTimeFormat().resolvedOptions().timeZone
    this.refreshTimer()
  }

  refreshTimer () {
    clearTimeout(this.timer)
    var dom = this.getDOM()
    var time = moment().locale(this.locale).tz(this.timezone)
    const childs = dom.querySelectorAll('mz-clock-particle')
    childs.forEach((child) => {
      if (typeof child.update === 'function') {
        child.update(time)
      }
    })
    this.timer = setTimeout(() => {
      if (this.dynamicsize) {
        var { width } = dom.host.getBoundingClientRect()
        var size = Math.ceil(width / this.dynamicsize)
        this.style.setProperty('font-size', size + 'px')
      }
      this.refreshTimer()
    }, 1000)
  }

  get isShadow () {
    return true
  }
}
