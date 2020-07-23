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

      promises.push(this.WebServer.init(config.server.webserver))
      promises.push(this.Components.init(config.components))
      promises.push(this.Commander.init(config.server.commander))
      promises.push(this.WebServer.bindComponent(this.Components.list()))
      promises.push(this.Commander.registerComponentCommand(
        this.Components.list()
      ))
      promises.push(this.WebServer.start(this.socketHandler.bind(this)))
      Promise.all(promises).then(resolve).catch(reject)
    })
  }

  socketHandler (_obj, ws) {
    const obj = JSON.parse(_obj)
    if (obj.message === 'SOCKET_OPENED') {
      var id = obj.id
      var client = this.Clients.register(id, ws)
      client.sendMessage('CLIENT_REGISTERED')
      client.sendMessage(
        'COMPONENTS_LOADED',
        this.Components.listId()
      )
      client.sendMessage(
        'LOAD_INJECTED_SCRIPTS',
        this.Components.allInjects('script')
      )
      client.sendMessage(
        'LOAD_INJECTED_STYLES',
        this.Components.allInjects('style')
      )
      client.sendMessage(
        'LOAD_INJECTED_MODULES',
        this.Components.allInjects('module')
      )
      client.sendMessage(
        'LOAD_CUSTOMELEMENTS',
        this.Components.allCustomElements()
      )
    }
    if (obj.message === 'CLIENT_PREPARED') {
      const scenario = async () => {
        await this.Components.start()
        await this.Components.onClientReady(obj.id)
      }
      scenario()
    }
  }

  start () {
    // console.log('started')
  }
}

const Server = new _Server()

module.exports = Server
