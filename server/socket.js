const ClientIO = require('socket.io-client')
const ServerIO = require('socket.io')
const Messenger = require('./messenger.js')

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
    var ns = this._regulateNSP(name)
    if (!ns) {
      console.warn(`'${name}' is not valid as a namespace of 'socket.io'. This registration will be ignored.`)
      return false
    }
    var nsp = this.serverIO.of(ns)
    if (!this.namespaces.has(nsp)) {
      nsp.on('connect', (socket) => {
        // nspManager(socket)
        var isClient = null
        socket.on('IM_CLIENT', (clientUID) => {
          console.log('Client registered.', clientUID)
          isClient = clientUID
        })
        socket.on('disconnect', () => {
          console.log('Socket is disconnected')
          console.log(isClient)
          nsp.to('SERVER').emit('_MESSAGE', {
            message: 'CLIENT_DISCONNECTED',
            clientUID: isClient
          })
          // do something when Client is disconnected
          // How to know this socket is client???
        })
        socket.on('JOIN_ROOM', (room) => {
          socket.join(room)
        })
        socket.on('LEAVE_ROOM', (room) => {
          socket.leave(room)
        })
        socket.on('_DATA', (to, key, data) => {
          const room = to.room
          if (!room) return
          nsp.to(room).emit('_DATA', key, data)
        })
        socket.on('_TO', (to, msgObj, fn) => {
          const {
            room = null,
            element = null
          } = to
          if (!room || !msgObj) {
            if (typeof fn === 'function') fn(false)
            return
          }
          nsp.to(room).clients((error, clients) => {
            if (error) throw error
            for (const member of clients) {
              var socket = nsp.sockets[member]
              if (element) {
                msgObj._element = element
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
}

const Socket = new _Socket()

module.exports = Socket
