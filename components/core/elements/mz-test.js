/* global CustomElement MZ */
export default class extends CustomElement {
  get isShadow () {
    return true
  }

  get hidable () {
    return true
  }

  get reconfigurable () {
    return true
  }

  defaultContent () {
    return '<style>:host{ display: block; } </style><div>This is default</div>'
  }

  onReady () {
    if (MZ.flushIconify) MZ.flushIconify()
    this.hide(null, {
      animation: [
        { transform: 'translateX(0)', opacity: 1 },
        { transform: 'translateX(-100%)', opacity: 0 }
      ]
    }).then(() => {
      setTimeout(() => {
        this.show()
      }, 1000)
    })
    /*
    setTimeout(() => {
      this.config.callback(this)
      this.hide().then(() => {
        setTimeout(() => {
          this.show(null, { timing: { duration: 3000 } })
        }, 1000)
      })
    }, 2000)
    */
  }
}
