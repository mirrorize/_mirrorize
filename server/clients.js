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
}

const Clients = new _Clients()

module.exports = Clients
