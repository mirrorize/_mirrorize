const express = require('express')
const session = require('express-session')
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')

class _WebServer {
  init (_config) {
    return new Promise((resolve, reject) => {
      try {
        this.config = _config
        this.defaultClient = _config.defaultClient || 'default'
        this.express = express()
        this.express.use(session({
          secret: 'jbydhgsidslvxlbamgaj8jexnfltxnfieajgwuu8dkvjduufajcrjthf2uf',
          resave: false,
          saveUninitialized: true,
          cookie: {
            sameSite: 'none',
            secure: true
          }
        }))
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

  start () {
    return new Promise((resolve, reject) => {
      try {
        this.express.get('/', (req, res) => {
          var client = req.query.client || this.defaultClient
          req.session.key = client
          res.sendFile(path.join(__dirname, '..', 'client', 'index.html'))
        })
        this.express.use('/_', express.static(path.join(__dirname, '..', 'client')))
        this.express.get('/MAIN', (req, res) => {
          res.type('.mjs').sendFile(path.join(__dirname, '..', 'client', 'main.js'))
        })
        this.express.use('/_client', (req, res, next) => {
          if (req.method !== 'GET') {
            next()
            return
          }
          var client = req.session.key || this.defaultClient
          var fPath = path.join(__dirname, '..', 'client', 'clients', client, req.path)
          var ext = fPath.split('.').pop()
          var stat = (fs.existsSync(fPath)) ? fs.lstatSync(fPath) : null
          if (stat && stat.isFile()) {
            res.type('.' + ext).sendFile(fPath)
          } else {
            res.status(404).send()
          }
        })
        this.express.use(
          '/3rdparty',
          express.static(path.join(__dirname, '..', '3rdparty'))
        )
        this.server.listen(this.port, () => {
          console.info('WebServer is started with port:', this.port)
          resolve()
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}

const WebServer = new _WebServer()

module.exports = WebServer
