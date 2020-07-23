class Client {
  constructor (id, ws = null) {
    this.id = id
    this.ws = ws
  }

  sendMessage (message, body) {
    const payload = {
      id: this.id,
      message: message,
      body: body
    }
    this.ws.send(JSON.stringify(payload))
  }

  setWs (ws) {
    this.ws = ws
  }
}

module.exports = Client
