/* global io */
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

const behaviors = {
  sendMessage: function (to, msgObj, callback) {
    this.emit('TO', to, msgObj, callback)
  },

  onMessage: function (handler) {
    this.on('_MESSAGE', (data, callback) => {
      console.log('msg comming', data)
      handler(data, callback)
    })
  },
  /*
  broadcastMessage: function (message, payload, callback) {
    const msgObj = {
      message: message,
      payload: payload
    }
    console.log('broad', msgObj)
    this.emit('BROADCAST', msgObj, callback)
  },
  */

  joinRoom: function (room) {
    this.emit('JOIN_ROOM', room)
  },

  leaveRoom: function (room) {
    this.emit('LEAVE_ROOM', room)
  }
}

class _Socket {
  constructor () {
    this.url = window.location.href
  }

  _regulateNSP (ns) {
    if (typeof ns !== 'string') return false
    if (ns.indexOf('/') !== 0) ns = '/' + ns
    return ns
  }

  getClientSocket (name = '') {
    var ns = this._regulateNSP(name)
    if (ns === '/') ns = ''
    var socket = io(this.url + ns)
    if (socket) {
      for (const method of Object.keys(behaviors)) {
        if (!Object.prototype.hasOwnProperty.call(socket, method)) {
          socket[method] = behaviors[method].bind(socket)
        }
      }
    }
    return socket
  }
}

const Socket = _Socket

export default Socket
