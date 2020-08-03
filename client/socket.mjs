/* global WebSocket */
const parseFunction = (str) => {
  var fnBodyIdx = str.indexOf('{')
  var fnBody = str.substring(fnBodyIdx + 1, str.lastIndexOf('}'))
  var fnDeclare = str.substring(0, fnBodyIdx)
  var fnParams = fnDeclare.substring(fnDeclare.indexOf('(') + 1, fnDeclare.lastIndexOf(')'))
  var args = fnParams.split(',')
  args.push(fnBody)
  function Fn () {
    return Function.apply(this, args)
  }
  Fn.prototype = Function.prototype
  return new Fn()
}

const reviver = (key, value) => {
  if (typeof value === 'string' && value.indexOf('__FUNC__') === 0) {
    value = value.slice(8)
    return parseFunction(value)
  }
  return value
}

class Socket {
  constructor (clientId, config, handler = () => {}) {
    this.id = clientId
    this.config = config
    this.isAlive = false
    this.session = new Map()
    /*
    const protocol = (config.protocol === 'https') ? 'wss' : 'ws'
    const address = config.address
    const port = config.port
    */
    const protocol = (window.location.protocol === 'https') ? 'wss' : 'ws'
    const address = window.location.hostname
    const port = window.location.port
    this.wsURL = `${protocol}://${address}:${port}?${this.id}`
    this.socket = null
    this.handler = (msg) => { handler(msg) }
  }

  setHandler (cb = () => {}) {
    this.handler = cb
  }

  connect (firstOpened = () => {}, onConnected = () => {}) {
    const poll = () => {
      this.socket = new WebSocket(this.wsURL)
      this.socket.onerror = (err) => {
        console.error(err.toString())
      }
      this.socket.onclose = () => {
        this.isAlive = false
        console.warn('Socket is not connected.:', this.wsURL)

        for (const [key, value] of this.session) {
          if (typeof value === 'function') value(false)
          this.session.delete(key)
        }
        this.session.clear()
        console.warn('Message session is cleared.')
        if (typeof window.MZ.notify === 'function') {
          window.MZ.notify({
            content: 'Socket is not connected..',
            type: 'error'
          })
        }
        setTimeout(() => {
          poll()
        }, 30 * 1000)
      }
      this.socket.onopen = (event) => {
        if (this.isAlive) {
          console.info('Socket is already alive.')
          return
        }
        this.isAlive = true
        onConnected()
      }
      this.socket.onmessage = (event) => {
        var message = JSON.parse(event.data, reviver)
        if (message._client !== this.id) return
        if (message._session && message._reply) {
          var r = this.session.get(message._session)
          if (r) {
            var { callback = null, original } = r
            if (typeof callback === 'function') {
              callback(message, original)
            }
          }

          this.session.delete(message._session)
        }
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

  sendMessage (message, callback) {
    var sessionId = null
    if (typeof callback === 'function') {
      sessionId = Date.now()
      this.session.set(sessionId, {
        callback: callback,
        original: message
      })
    }

    var msg = Object.assign({}, message, {
      _client: this.id,
      _session: (sessionId) || null
    })
    if (this.isAlive) this.socket.send(JSON.stringify(msg))
  }
}

export default Socket
