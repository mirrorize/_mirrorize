/* global CustomElement */

export default class extends CustomElement {
  get isShadow () {
    return false
  }

  init () {
    this.template = (this.config.template)
      ? this.config.template
      : '<div class="grid main layer layout>"'
  }

  onConnected () {
    this.innerHTML = this.config.template.trim()
    if (this.config.elementLayout) {
      import(this.config.elementLayout).then(({ default: elements }) => {
        for (const el of elements) {
          if (!el.name) continue
          var cfg = window.MZ.getStorage(el.name, 'config')
          var mergedCfg = Object.assign({}, cfg, el.config)
          // window.MZ.setStorage(el.name, 'config', mergedCfg)
          var elem = document.createElement(el.name)
          elem.config = Object.assign({}, elem.config, mergedCfg)
          if (el.id) elem.setAttribute('id', el.id)
          var target = null
          if (el.position) {
            target = (el.position.target) ? el.position.target : null
            const {
              area = null,
              column = null,
              row = null
            } = el.position
            if (area) elem.style.gridArea = area
            if (column) elem.style.gridColumn = column
            if (row) elem.style.gridRow = row
          }
          if (target) {
            this.querySelector(target).appendChild(elem)
          } else {
            this.appendChild(elem)
          }
        }
      })
    }
  }
}
