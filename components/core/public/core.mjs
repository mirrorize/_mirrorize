const isCoreLoaded = true

window.MZ.registerOnReadyJob(() => {
  var body = window.document.querySelector('body')
  var notify = window.document.createElement('mz-notify')
  body.appendChild(notify)
})

export { isCoreLoaded }
