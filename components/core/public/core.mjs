const isCoreLoaded = true
MZ = window.MZ
MZ.registerOnReadyJob(() => {
  var body = window.document.querySelector('body')
  var notify = window.document.createElement('mz-notify')
  body.appendChild(notify)
})

console.log(moment)

export { isCoreLoaded }
