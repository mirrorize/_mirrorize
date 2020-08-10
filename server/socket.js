const ClientIO = require('socket.io-client')
const ServerIO = require('socket.io')
const Messenger = require('./messenger.js')

const behaviors = {
  /*
  sendMessage: function (to, msgObj, callback) {
    console.log('sending', to, msgObj)
    this.emit('TO', to, msgObj, callback)
  },

  onMessage: function (handler) {
    this.on('_MESSAGE', (data, callback) => {
      handler(data, callback)
    })
  },
  */

  joinRoom: function (room) {
    console.log('so-join', room, this.id)
    // this.join(room)
    this.emit('JOIN_ROOM', room)
  },

  leaveRoom: function (room) {
    // this.leave(room)
    this.emit('LEAVE_ROOM', room)
  }
}

class _Socket {
  constructor () {
    this.namespaces = new Set()
    this.url = null
    this.serverIO = null
  }

  init (server, localURL) {
    return new Promise((resolve, reject) => {
      this.serverIO = ServerIO(server)
      this.url = localURL
      resolve()
    })
  }

  getClientSocket (name) {
    return new Promise((resolve, reject) => {
      var ns = this._regulateNSP(name)
      var socket = ClientIO(this.url + ns)
      if (socket) {
        socket.on('connect', () => {
          resolve(socket)
        })
        for (const method of Object.keys(behaviors)) {
          if (!Object.prototype.hasOwnProperty.call(socket, method)) {
            socket[method] = behaviors[method].bind(socket)
          }
        }
      } else {
        reject(new Error('Fail to create socket:', ns))
      }
    })
  }

  getClientMessenger (name) {
    return new Promise((resolve, reject) => {
      this.getClientSocket(name).then((socket) => {
        resolve(new Messenger(socket))
      }).catch((error) => {
        console.error(error.message)
        reject(error)
      })
    })
  }

  initNamespace (name, nspManager = () => {}) {
    console.log('initNamespace')
    var ns = this._regulateNSP(name)
    if (!ns) {
      console.warn(`'${name}' is not valid as a namespace of 'socket.io'. This registration will be ignored.`)
      return false
    }
    var nsp = this.serverIO.of(ns)
    if (!this.namespaces.has(nsp)) {
      nsp.on('connect', (socket) => {
        // nspManager(socket)
        socket.on('JOIN_ROOM', (room) => {
          socket.join(room)
        })
        socket.on('LEAVE_ROOM', (room) => {
          socket.leave(room)
        })
        socket.on('_TO', (msgObj, fn) => {
          const {
            _to = null,
            _msgObj = null
          } = msgObj
          const {
            room = null,
            element = null
          } = _to
          if (!room || !_msgObj) {
            if (typeof fn === 'function') fn(false)
            return
          }
          nsp.to(room).clients((error, clients) => {
            if (error) throw error
            for (const member of clients) {
              var socket = nsp.sockets[member]
              msgObj = {
                _msgObj,
                _element: element
              }
              socket.emit('_MESSAGE', msgObj, fn)
            }
          })
        })
      })
      this.namespaces.add(nsp)
    }
    return nsp
  }

  _regulateNSP (ns = '') {
    if (typeof ns !== 'string') return false
    if (ns.indexOf('/') !== 0) ns = '/' + ns
    return ns
  }

  bindComponent (Components) {
    for (const component of Components.list()) {
      var socket = this.getClientSocket()
      component.setSocket(socket)
    }
  }
}

const Socket = new _Socket()

module.exports = Socket
