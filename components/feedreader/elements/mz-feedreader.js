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
}

</style>
<div id="self" part="content">
  <div class="title" part="title"></div>
</div>
`

export default class extends CustomElement {
  get isSahdow () {
    return true
  }

  get hidable () {
    return true
  }

  static observableAttributes () {
    return ['refresh']
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

  _test (ret) {
    // console.log('@@@', ret)
  }

  work () {
    clearTimeout(this.timer)
    this.sendMessageToComponent('REQUEST', (ret) => {
      this._test(ret)
    })
    /*
    console.log('send?')
    MZ.sendMessage('TEST', {
      foo: 'bar',
      refresh: this.refresh,
      uid: this.uid
    })
    this.sendMessage('TEST', {
      foo: 'bar',
      refresh: this.refresh,
      uid: this.uid
    }, this._test)
    setTimeout(() => {
      this.work()
    }, this.refresh)
    */
  }
}
