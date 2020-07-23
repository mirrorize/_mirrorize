/* global WebSocket */

class Socket {
  constructor (clientId, config, handler = () => {}) {
    this.id = clientId
    this.config = config
    /*
    const protocol = (config.protocol === 'https') ? 'wss' : 'ws'
    const address = config.address
    const port = config.port
    */
    const protocol = (window.location.protocol === 'https') ? 'wss' : 'ws'
    const address = window.location.hostname
    const port = window.location.port
    this.wsURL = `${protocol}://${address}:${port}`
    this.socket = null
    this.handler = handler
  }

  setHandler (cb = () => {}) {
    this.handler = cb
  }

  connect (reconnect = () => {}) {
    const poll = () => {
      this.socket = new WebSocket(this.wsURL)
      this.socket.onerror = (err) => {
        console.error(err.toString())
      }
      this.socket.onclose = () => {
        console.warn('Socket is not connected.:', this.wsURL)
        window.MZ.notify({
          content: 'Socket is not connected yet.',
          type: 'error'
        })
        setTimeout(() => {
          poll()
        }, 30 * 1000)
      }
      this.socket.onopen = (event) => {
        var r = reconnect()
        if (r) {
          console.info('Socket is connected.', this.wsURL)
          this.sendMessage('SOCKET_OPENED', this.wsURL)
        }
      }
      this.socket.onmessage = (event) => {
        var message = JSON.parse(event.data)
        if (message.id !== this.id) return
        this.handler(message)
      }
    }
    return new Promise((resolve) => {
      try {
        poll()
      } catch (e) {
        console.warn(e)
        // this.connect()
      }
    })
  }

  sendMessage (message, body = null) {
    var payload = {
      id: this.id,
      message: message,
      body: body
    }
    this.socket.send(JSON.stringify(payload))
  }
}

export default Socket
