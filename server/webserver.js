const express = require('express')
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const WebSocket = require('ws')

class _WebServer {
  init (_config) {
    return new Promise((resolve, reject) => {
      try {
        this.config = _config
        this.express = express()
        this.wss = null
        this.port = (_config.port) ? _config.port : '8080'
        this.address = (_config.address) ? _config.address : '127.0.0.1'
        this.protocol = (_config.useSecure) ? 'https' : 'http'
        if (
          _config.expressExtraSetup &&
          typeof _config.expressExtraSetup === 'function'
        ) {
          _config.expressExtraSetup(this.express)
        }
        if (_config.useSecure) {
          const privateKeyPath =
            (_config.privateKey) ? _config.privateKey : './https.key'
          const certificatePath =
            (_config.certificate) ? _config.certificate : './https.crt'
          const key = fs.readFileSync(privateKeyPath, 'utf8')
          const cert = fs.readFileSync(certificatePath, 'utf8')
          const credentials = { key: key, cert: cert }
          this.server = https.createServer(credentials, this.express)
        } else {
          this.server = http.createServer(this.express)
        }
        resolve()
      } catch (e) {
        console.error('Fail to initiate WebServer')
        reject(e)
      }
    })
  }

  bindComponent (components) {
    return new Promise((resolve, reject) => {
      if (!components || !Array.isArray(components)) {
        console.warn('There is no component to bind to socket. It might not be the error, but you need to check your configuration.')
        resolve()
      }
      try {
        for (const component of components) {
          var route = '/' + component.id
          var cb = component.webserve.bind(component)
          const statics = route + '/static'
          this.express.use(statics, express.static(path.join(component.dir, 'static')))
          console.info(`Route for static files '${statics}' is added to webserver.`)
          const elements = route + '/elements'
          this.express.use(elements, express.static(path.join(component.dir, 'elements')))
          this.express.all(route, cb)
          console.info(`Route '${route}' is added to webserver.`)
        }
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  start (transporter = () => {}) {
    return new Promise((resolve, reject) => {
      try {
        this.express.get('/', (req, res) => {
          res.sendFile(path.join(__dirname, '..', 'client', 'index.html'))
        })
        this.express.use(
          '/_',
          express.static(path.join(__dirname, '..', 'client'))
        )
        this.express.use(
          '/_/config/:config', (req, res) => {
            var config = (req.params.config) ? req.params.config : 'config'
            var configPath = config + '.js'
            var filePath = path.join(__dirname, '..', configPath)
            try {
              var content = fs.readFileSync(filePath) + '\nexport default config'
              res.type('.mjs')
              res.send(Buffer.from(content))
            } catch (e) {
              res.status(404).end()
            }
          }
        )
        this.express.use(
          '/3rdparty',
          express.static(path.join(__dirname, '..', '3rdparty'))
        )
        this.server.listen(this.port, () => {
          console.info('WebServer is started.')
          this.connectSocket(transporter)
          resolve()
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  connectSocket (transporter = () => {}) {
    const connect = () => {
      const interval = setInterval(() => {
        this.wss.clients.forEach((ws) => {
          if (ws.isAlive !== true) return ws.terminate()
          ws.isAlive = false
          ws.ping()
        })
      }, 10 * 1000)

      this.wss = new WebSocket.Server({ server: this.server })
      this.wss.on('connection', (ws) => {
        // console.info('Socket is connected newly.')
        ws.isAlive = true
        ws.on('pong', () => {
          ws.isAlive = true
        })
        ws.on('message', (data) => { transporter(data, ws) })
      })

      this.wss.on('close', () => {
        console.info('Socket is closed accidentally.')
        clearInterval(interval)
        connect()
      })
    }
    connect()
  }
}

const WebServer = new _WebServer()

module.exports = WebServer
