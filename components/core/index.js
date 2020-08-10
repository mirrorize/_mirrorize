const { ComponentClass, ComponentHelper } = require('../../server/component-helper.js')

module.exports = class extends ComponentClass {
  injectModuleScripts () {
    return [
      '/core/public/core.mjs'
    ]
  }

  injectStyles () {
    return [
      '/core/misc/fonts/fonts.css'
    ]
  }

  staticRoutes () {
    return ['/misc']
  }

  onStart () {
    /*
    this.sendMessage('COMPONENT', { foo: 1 }, (ret) => {
      console.log('msg replied:', ret)
    })
    this.sendMessage('COMPONENT(NAME:core)', { foo: 2 }, (ret) => {
      console.log('msg replied:', ret)
    })
    */
  }

  onMessage (msgObj, reply) {
    reply({
      replied: true,
      payload: msgObj
    })
  }

  onClientReady (clientUID, clientName) {
    setTimeout(() => {
      this.transportData(`CLIENT(UID:${clientUID})`, 'OOPS', clientName)
      this.sendMessage(`CLIENT(UID:${clientUID})/ELEMENT(NAME:mz-notify)`, {
        message: 'NOTIFY',
        payload: {
          type: 'log',
          title: 'Message from Server',
          content: `Hello, Client ${clientName}!<br>Glad to meet you.`,
          icon: `<span class="iconify" data-icon="gridicons:comment"></span>`,
          timer: 1000000,
          position: 'bottom right'
        }
      })
    }, 3000)
  }
}
