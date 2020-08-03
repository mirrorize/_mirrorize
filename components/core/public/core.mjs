const isCoreLoaded = true

window.MZ.registerOnReadyJob(() => {
  var body = window.document.querySelector('body')
  var notify = window.document.createElement('mz-notify')
  body.appendChild(notify)
})

// prepareCore()

setTimeout(() => {
  window.MZ.notify({
    content: 'Mirrorized is on.',
    title: '1oops',
    type: 'error',
    timer: 8000,
    icon: '<span class="iconify" data-icon="flat-color-icons:rating" data-inline="true"></span>',
    position: 'top left'
  })
  window.MZ.notify({
    content: 'Mirrorized is on.',
    title: '2oops',
    type: 'info',
    timer: 4000,
    icon: '<span class="iconify" data-icon="flat-color-icons:rating" data-inline="true"></span>',
    position: 'top left',
    callback: () => {
      console.log('oops')
    }
  })
  window.MZ.notify({
    content: '<p>new image</p><img src="https://via.placeholder.com/150">',
    title: '3oops',
    type: 'warn',
    timer: 15000000,
    icon: '<span class="iconify" data-icon="flat-color-icons:rating" data-inline="true"></span>',
    position: 'bottom right',
    styleOverride: `
.warn {
  background-color:#09F;
  color: white;
}
.warn .title {
  background-color:#FF3;
}
`
  })
  window.MZ.notify({
    content: '<p>new image</p><img src="https://via.placeholder.com/150">',
    title: '4warn',
    type: 'warn',
    timer: 15000000,
    icon: '<span class="iconify" data-icon="flat-color-icons:rating" data-inline="true"></span>',
    position: 'bottom right'
  })
}, 1500)

export { isCoreLoaded }
