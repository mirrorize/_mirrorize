const { ComponentClass, Log } = require('../../server/component-helper.js')

const _ = Log('C:CORE')

module.exports = class extends ComponentClass {
  injectStyles () {
    return [
      '/core/public/misc/fonts/fonts.css'
    ]
  }

  injectScripts () {
    return [
      '/core/public/misc/luxon.js'
    ]
  }

  staticRoutes () {
    return ['/misc']
  }

  /*
  onMessage (msgObj, reply) {
    reply({
      replied: true,
      payload: msgObj
    })
  }
  */

  onClientReady (clientUID, clientName) {
    setTimeout(() => {
      this.sendMessage(`CLIENT(UID:${clientUID})/ELEMENT(NAME:mz-notify)`, {
        message: 'NOTIFY',
        payload: {
          type: 'log',
          title: 'Message from Server',
          content: `Hello, Client '${clientName}'!<br>Glad to meet you.`,
          icon: `<span class="iconify" data-icon="gridicons:comment"></span>`,
          timer: 10000,
          position: 'bottom right'
        }
      })
    }, 1000)
  }

  onClientDisconnected (clientUID, clientName) {
    _.log('Disconnected')
  }
}
