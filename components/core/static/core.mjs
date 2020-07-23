function prepareCore () {
  var body = document.querySelector('body')
  var notify = document.createElement('mz-notify')
  body.appendChild(notify)
  var layout = document.createElement('mz-layout')
  body.appendChild(layout)
  console.info('Layouts are prepared.')
}

setTimeout(() => {
  window.MZ.notify({
    content: 'hello, world',
    title: 'oops',
    type: 'error',
    timer: 6000,
    position: 'top right'
  })
  window.MZ.notify({
    content: 'hello, world jv;gwyfud jv;gwyfuf ',
    title: 'oops',
    type: 'error',
    timer: 3000,
    position: 'top left'
  })
  window.MZ.notify({
    content: 'dooah! bajklfda jkfd jfkdjkl;f3 jklf; jfkea <br/>jklf;ea jkl;j fefeafae; ds jbydhgs idslvxlbamgaj8 jexnfltx nfieajgw jk;j',
    title: 'second',
    type: 'warn',
    position: 'bottom right',
    timer: 5000,
    callback: () => { console.log('message finished') }
  })
}, 1500)

function foo () {
  console.log('bar')
}

export { prepareCore as onLoaded, foo }
