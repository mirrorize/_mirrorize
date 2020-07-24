const WebSocket = require('ws')

class _WebSocket {
  init (server) {
    return new Promise((resolve, reject) => {
      this.server = server
      this.wss = null
      resolve()
    })
  }

  start (transporter = () => {}) {
    const connect = () => {
      const interval = setInterval(() => {
        this.wss.clients.forEach((ws) => {
          if (ws.isAlive !== true) return ws.terminate()
          ws.isAlive = false
          ws.ping()
        })
      }, 30 * 1000)

      this.wss = new WebSocket.Server({ server: this.server })
      this.wss.on('connection', (ws, req) => {
        var id = req.url.substring(2)
        if (!id) {
          console.error('Invalid connection')
          ws.terminate()
          return
        }
        ws.id = id
        ws.isAlive = true
        ws.on('pong', () => { ws.isAlive = true })
        ws.on('message', (data) => {
          var parsed = JSON.parse(data)
          const { _session = null, _client, message } = parsed
          const reply = (_session)
            ? (msg) => {
              this.sendMessage({
                _reply: true,
                _session: _session,
                _client: _client,
                message: msg,
                original: message
              }, ws)
            }
            : () => {}
          const replyError = (_session)
            ? (error) => {
              console.error(error)
              this.sendMessage({
                _reply: true,
                _session: _session,
                _client: _client,
                message: error,
                original: message
              }, ws)
            }
            : (error) => {
              console.error(error)
            }
          transporter(parsed, ws).then(reply).catch(replyError)
        })
      })

      this.wss.on('close', () => {
        console.info('Socket is closed accidentally.')
        clearInterval(interval)
        connect()
      })
    }
    connect()
  }

  sendMessage (msg, ws) {
    ws.send(JSON.stringify(msg))
  }
}

var websocket = new _WebSocket()

module.exports = websocket
