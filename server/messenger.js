class Messenger {
  constructor (socket) {
    this.socket = socket
  }

  transportData (to, key, data) {
    const parsed = this.parse(to)
    if (parsed instanceof Error) {
      throw parsed
    }
    this.socket.emit('_DATA', parsed, key, data)
  }

  sendMessage (to, msgObj, callback) {
    return new Promise((resolve, reject) => {
      const parsed = this.parse(to)
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
      handler(msgObj, cb)
    })
  }

  joinRoom (room) {
    this.socket.emit('JOIN_ROOM', room)
  }

  leaveRoom (room) {
    this.socket.emit('LEAVE_ROOM', room)
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

module.exports = Messenger
