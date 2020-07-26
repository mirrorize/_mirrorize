var config = {
  component: {},
  'mz-layout': {
    template: `
<div class="layout grid background layer">
  <mz-laylout-holder id="bottom_right" class="leftBox"></mz-layout-holder>
</div>
<div class="layout grid main layer"></div>
<div class="layout grid foreground layer"></div>
    `,
    elementLayout: '/core/static/layout.js'
  },

  'mz-notify': {
    position: 'bottom right',
    timer: 5000,
    type: 'log'
  }
}

module.exports = config
