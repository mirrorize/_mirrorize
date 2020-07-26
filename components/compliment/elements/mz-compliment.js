/* global CustomElement, fetch */
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
}

</style>
<div id="self" part="content"></div>
`

export default class extends CustomElement {
  get isSahdow () {
    return true
  }

  get hidable () {
    return true
  }

  static observableAttributes () {
    return ['src', 'refresh']
  }

  onAttributeChanged (name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue
      this.work()
    }
  }

  getTemplate () {
    return template.trim()
  }

  onConnected () {
    console.log('cmp-onconnected?')
    this.src = (this.config.src) ? this.config.src : '/compliment'
    this.refresh = (this.config.refresh) ? this.config.refresh : 1000 * 60
    this.timer = null
    this.content = '...'
    this.work()
  }

  work () {
    clearTimeout(this.timer)
    fetch(this.src).then((response) => {
      if (response.status !== 200) {
        this.content = 'Invalid src URL for compliment'
        console.warn(this.content)
        return
      }
      return response.text()
    }).then((text) => {
      this.hide(this.uid).then(() => {
        var dom = this.getDOM().querySelector('#self')
        dom.innerHTML = text
        this.show(this.uid).catch(() => {})
      }).catch(() => {})
    }).catch((e) => {
      console.warn(e)
    })
    setTimeout(() => {
      this.work()
    }, this.refresh)
  }
}
