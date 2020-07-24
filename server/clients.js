const Client = require('./client.js')

class _Clients {
  constructor () {
    this.clients = []
  }

  register (id, ws) {
    var found = this.findById(id)
    if (!found) {
      found = new Client(id, ws)
      this.clients.push(found)
      console.info(`Client '${id}' is connected.`)
    } else {
      found.setWs(ws)
      console.info(`Client '${id}' is reconnected.`)
    }
    return found
  }

  findById (id) {
    return this.clients.find((client) => {
      return (client.id === id)
    })
  }

  sendMessageToClient (from, to, message) {
    const { _client } = to
    var client = this.findById(_client)
    if (client) {
      client.sendMessageToClient(from, to, message)
    } else {
      this.clients.forEach((client, i) => {
        client.sendMessageToClient(from, to, message)
      })
    }
  }

  sendElementMessage (target, result) {
    var { client, ...rest } = target
    var c = this.findById(client)
    if (c) {
      c.sendElementMessage(rest, result)
    } else {
      console.warn(`Invalid client Id : ${client}`)
    }
  }
}

const Clients = new _Clients()

module.exports = Clients
