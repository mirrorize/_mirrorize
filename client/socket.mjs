/* global io */
/*
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
*/

class Messenger {
  constructor (socket, on = {}) {
    this.socket = socket
    for (var [method, fn] of Object.entries(on)) {
      this.socket.on(method, fn.bind(this))
    }
  }

  registerClient (clientUID) {
    this.socket.emit('IM_CLIENT', clientUID)
  }

  sendMessage (to, msgObj, callback) {
    return new Promise((resolve, reject) => {
      var parsed = this.parse(to)
      if (parsed instanceof Error) {
        callback(parsed)
        reject(parsed)
      }
      this.socket.emit('_TO', parsed, msgObj, callback)
      resolve()
    })
  }

  onMessage (handler = (msgObj, reply) => {}) {
    this.socket.on('_MESSAGE', (msgObj, cb) => {
      if (msgObj._element) {
        this.virtualOnMessage(msgObj._element, msgObj, cb)
      } else {
        handler(msgObj, cb)
      }
    })
  }

  virtualOnMessage (element, msgObj, reply) {
    var targets = []
    if (!element.type) {
      targets = document.querySelectorAll('[mzcustomelement]')
    } else if (element.type === 'NAME') {
      targets = document.querySelectorAll(element.value)
    } else if (element.type === 'UID') {
      targets = document.querySelectorAll(`#${element.value}`)
    }
    if (!targets) {
      reply(false)
      return false
    }
    for (var t of [...targets]) {
      if (typeof t.onMessage === 'function') t.onMessage(msgObj, reply)
    }
  }

  joinRoom (room) {
    this.socket.emit('JOIN_ROOM', room)
    if (!this.socket._joinRoom) {
      this.socket._joinRoom = new Set()
    }
    this.socket._joinRoom.add(room)
  }

  leaveRoom (room) {
    this.socket.emit('LEAVE_ROOM', room)
    this.socket._joinRoom.delete(room)
  }

  parse (toString) {
    const rootPattern = [
      /^(?<room>SERVER)$/ig,
      /^(?<room>COMPONENT)$/ig,
      /^(?<room>COMPONENT\(NAME:[^)]+\))$/ig,
      /^(?<room>CLIENT)$/ig,
      /^(?<room>CLIENT\((NAME|UID):[^)]+\))$/ig,
      /^(?<room>CLIENT)\/(?<element>ELEMENT)$/ig,
      /^(?<room>CLIENT)\/(?<element>(ELEMENT)\((?<elementType>NAME|UID):(?<elementValue>[^)]+)\))$/ig,
      /^(?<room>CLIENT\((NAME|UID):[^)]+\))\/(?<element>ELEMENT)$/ig,
      /^(?<room>CLIENT\((NAME|UID):[^)]+\))\/(?<element>(ELEMENT)\((?<elementType>NAME|UID):(?<elementValue>[^)]+)\))$/ig
    ]
    if (typeof toString !== 'string') return new Error(`Invalid string as 'to' of 'sendMessage': ${toString}`)
    var found = rootPattern.map((rx) => {
      return rx.exec(toString)
    }).reduce((total, value) => {
      if (value) total = value
      return total
    })
    if (!found) return new Error(`No matched string as 'to' of 'sendMessage: ${toString}'`)
    var ret = {}
    ret.room = found.groups.room
    if (found.groups.element) ret.element = { element: true }
    if (found.groups.elementType) {
      ret.element.type = found.groups.elementType
      ret.element.value = found.groups.elementValue
    }
    return ret
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

  getClientSocket (name, options = null) {
    return new Promise((resolve, reject) => {
      var ns = this._regulateNSP(name)
      if (ns === '/') ns = ''
      var socket = io(this.url + ns, options)
      if (socket) {
        socket.on('connect', () => {
          resolve(socket)
        })
      } else {
        reject(new Error('Fail to create socket:', ns))
      }
    })
  }

  getClientMessenger (name, on, options = null) {
    return new Promise((resolve, reject) => {
      this.getClientSocket(name, options).then((socket) => {
        resolve(new Messenger(socket, on))
      }).catch((error) => {
        console.error(error.message)
        reject(error)
      })
    })
  }
}

const Socket = _Socket

export default Socket
