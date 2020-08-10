// const io = require('socket.io-client')
const Messenger = require('./messenger.js')

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
          // await this.Socket.bindComponent(this.Components)
          await this.Commander.registerComponentCommand(this.Components.list())
          // await this.WebSocket.start(this.socketHandler.bind(this))
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
      })
      // this.selfSocket.onMessage(this.messageHandler.bind(this))
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
        var { clientUID, clientName } = msgObj
        this.Components.onClientReady(clientUID, clientName)
        break
    }
  }

  socketHandler (socket) {
    socket.on('connect', () => {
      console.log('something is connected to Server')
    })
    socket.on('disconnect', () => {
      console.log('something is disconnected from Server')
    })
    socket.on('_MESSAGE', (data, callback = () => {}) => {
      console.log(this.config)
      console.log(data)
    })
  }

  _socketHandler (obj, ws) {
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
}

const Server = new _Server()

module.exports = Server
