
class _Server {
  start (config) {
    const checkConfig = (config) => {
      if (!config) {
        throw new Error('Invalid server configuration')
      }
      // if (!config.commander) throw new Error('Invalid server configuration (commander)')
    }
    return new Promise((resolve, reject) => {
      try {
        checkConfig(config)
      } catch (e) {
        reject(e)
        return
      }

      const configParts = ['webserver', 'components', 'commander']

      for (var c of configParts) {
        config[c] = Object.assign({}, config.common, config[c])
      }

      this.Components = require('./components.js')
      this.WebServer = require('./webserver.js')
      this.Commander = require('./commander.js')
      this.Clients = require('./clients.js')
      this.Socket = require('./socket.js')
      // this.WebSocket = require('./websocket.js')
      //

      const scenario = async () => {
        try {
          await this.WebServer.start(config.webserver)
          await this.Socket.init(this.WebServer.server, this.WebServer.serverURL())
          await this.prepareSelfClientSocket()
          await this.Components.init(config.components)
          await this.Components.prepareClient()
          await this.Commander.init(config.commander)
          await this.WebServer.bindComponent(this.Components)
          await this.Commander.registerComponentCommand(this.Components.list())
          await this.Components.start()
          resolve()
        } catch (e) {
          reject(e)
        }
      }
      scenario()
    })
  }

  prepareSelfClientSocket () {
    var job = new Promise((resolve, reject) => {
      this.Socket.initNamespace('/', this.nspHandler)
      this.Socket.getClientMessenger('/').then((messenger) => {
        this.messenger = messenger
        this.messenger.joinRoom('SERVER')
        this.messenger.onMessage(this.messageHandler.bind(this))
      })
      resolve()
    })
    var timer = new Promise((resolve, reject) => {
      var wait = setTimeout(() => {
        clearTimeout(wait)
        reject(new Error('Timed out in socket connecting'))
      }, 1000)
    })
    return Promise.race([job, timer])
  }

  nspHandler (socket) {
    // reserved.
  }

  messageHandler (msgObj, reply) {
    const message = msgObj.message
    switch (message) {
      case 'REQUEST_BROWSER_ASSETS':
        reply(this.Components.getClientFeed())
        break
      case 'BROWSER_PREPARED':
        this.Components.onClientReady(msgObj)
        break
      case 'CLIENT_DISCONNECTED':
        this.Components.onClientDisconnected(msgObj)
        break
    }
  }
}

const Server = new _Server()

module.exports = Server
