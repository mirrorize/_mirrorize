class _Server {
  init (config) {
    const checkConfig = (config) => {
      this.serverId = null
      if (!config) {
        throw new Error('Invalid server configuration')
      }
      if (!config.server) {
        throw new Error('Invalid server configuration (server)')
      }
      if (!config.components) {
        throw new Error('Invalid server configuration (components)')
      }
      // if (!config.commander) throw new Error('Invalid server configuration (commander)')
    }

    return new Promise((resolve, reject) => {
      try {
        checkConfig(config)
      } catch (e) {
        reject(e)
      }

      var promises = []
      this.Components = require('./components.js')
      this.WebServer = require('./webserver.js')
      this.Commander = require('./commander.js')
      this.Clients = require('./clients.js')
      this.WebSocket = require('./websocket.js')

      promises.push(this.WebServer.init(config.server.webserver))
      promises.push(this.WebSocket.init(this.WebServer.server))
      promises.push(this.Components.init(config.components))
      promises.push(this.Commander.init(config.server.commander))
      promises.push(this.WebServer.bindComponent(this.Components.list()))
      promises.push(this.Commander.registerComponentCommand(
        this.Components.list()
      ))
      promises.push(this.WebServer.start())
      promises.push(this.WebSocket.start(this.socketHandler.bind(this)))
      Promise.all(promises).then(resolve).catch(reject)
    })
  }

  socketHandler (obj, ws) {
    return new Promise((resolve, reject) => {
      const { message, _client } = obj
      switch (message.key) {
        case 'TO_COMPONENT':
          this.Components.messageToComponent(obj).then(resolve).catch(reject)
          break
        case 'SOCKET_OPENED':
          var client = this.Clients.register(_client, ws)
          if (client) {
            this.Components.prepareClient().then(resolve).catch(reject)
          } else {
            reject(new Error('CLIENT_REGISTER_FAIL'))
          }
          break
        case 'CLIENT_PREPARED':
          this.Components.onClientReady(_client).then(resolve).catch(reject)
          break
        default:
          reject(new Error('UNDEFINED_KEY'))
          break
      }
    })
  }

  start () {
    const scenario = async () => {
      await this.Components.start()
    }
    scenario()
  }
}

const Server = new _Server()

module.exports = Server
