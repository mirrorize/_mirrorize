class _Server {
  init (config) {
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
      this.Components = require('./components.js')
      this.WebServer = require('./webserver.js')
      this.Commander = require('./commander.js')
      this.Clients = require('./clients.js')
      this.WebSocket = require('./websocket.js')

      const scenario = async () => {
        try {
          await this.WebServer.init(config.webserver)
          await this.WebSocket.init(this.WebServer.server)
          await this.Components.init(config.components)
          await this.Components.prepareClient()
          await this.Commander.init(config.commander)
          await this.WebServer.bindComponent(this.Components)
          await this.Commander.registerComponentCommand(this.Components.list())
          await this.WebServer.start()
          await this.WebSocket.start(this.socketHandler.bind(this))
          resolve()
        } catch (e) {
          reject(e)
        }
      }
      scenario()
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
            resolve(this.Components.getClientFeed())
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
