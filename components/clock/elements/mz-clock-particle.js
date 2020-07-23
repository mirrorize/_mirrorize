/* global CustomElement */
const template = `
<span id="self" part="clock-particle-content"></span>
`

export default class extends CustomElement {
  get isSahdow () {
    return true
  }

  static observableAttributes () {
    return ['format', 'value']
  }

  init () {
    this.format = (this.config.format) ? this.config.format : ''
    this.value = ''
  }

  onAttributeChanged (name, oldValue, newValue) {
    if (name === 'format') {
      this.format = newValue
    }
    if (name === 'value') {
      if (oldValue !== newValue) {
        this.value = newValue
        this.render()
      }
    }
  }

  getTemplate () {
    return template.trim()
  }

  onConnected () {
    this.setAttribute('exportparts', 'content')
  }

  updateDOM (dom) {
    var value = this.value
    var t = dom.querySelector('#self')
    t.innerHTML = value
    /*
    if (this.format === 'COUNTRY') {
      t.classList.add('iconify')
      t.classList.add('flag')
      t.dataset.icon = `cif:${value}`
      t.dataset.inline = 'false'
      t.innerHTML = value
    } else {
      t.innerHTML = value
    }
    */
  }

  update (time) {
    if (this.format === 'COUNTRY') {
      var loc = time.locale().slice(-2).toLowerCase()
      this.setAttribute('value', loc)
    } else {
      this.setAttribute('value', time.format(this.format))
    }
    this.render()
  }
}
