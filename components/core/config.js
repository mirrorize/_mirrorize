module.exports = {
  disabled: false,
  config: {

  },
  elements: {
    'mz-test': {
      config: {
        foo: 1,
        test: function () { console.log('oops') },
        test1: function oops (a, b, c, d) { console.log(a, b, c, d) },
        test2: (b, ...rest) => { console.log(b, rest) }
      }
    },
    'mz-notify': {
      timer: 5000,
      type: 'log',
      className: 'foo',
      position: 'bottom left',
      icon: 'Wow <span class="iconify-inline" data-icon="fa-solid:home">!</span>:'
    }
  }

  /* Usually you don't need this redefine. */
  /*
  _moduleScripts: [
    '/core/static/core.mjs'
  ],

  _scripts: [
    '/3rdparty/moment.js',
    '/3rdparty/moment-timezone.js'
  ],

  _styles: [
    '/core/static/core.css'
  ]
  */
  /*
  'mz-layout': {
    template: `
<div class="layout grid background layer">
  <mz-laylout-holder id="bottom_right"></mz-layout-holder>
</div>
<div class="layout grid main layer"></div>
<div class="layout grid foreground layer">
  <mz-laylout-holder id="feedPosition"></mz-layout-holder>
</div>
    `,
    elementLayout: '/core/static/layout.js'
  },
  */
}
