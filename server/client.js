class Client {
  constructor (id, ws = null) {
    this.id = id
    this.ws = ws
    this.ws.on('close', () => {
      console.info(`Client '${this.id}' is closed.`)
    })
  }

  sendMessageToClient (from, to, msg) {
    var message = {
      message: {
        key: 'TO_CLIENT',
        payload: msg
      },
      _component: from._component,
      _element: to._element,
      _tagname: to._tagname,
      _client: this.id
    }
    this.ws.send(JSON.stringify(message))
  }

  setWs (ws) {
    this.ws = ws
  }
}

module.exports = Client
