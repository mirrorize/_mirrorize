function prepareCore () {
  var body = document.querySelector('body')
  var notify = document.createElement('mz-notify')
  body.appendChild(notify)
}
/*
setTimeout(() => {
  window.MZ.notify({
    content: 'Mirrorized is on.',
    title: 'oops',
    type: 'log',
    timer: 10000,
    position: 'bottom left'
  })
}, 1500)
*/

export { prepareCore as onLoaded }
