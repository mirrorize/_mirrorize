const log = require('./server/logger.js')('INDEX')
const path = require('path')
const args = require('yargs').argv
const { configureFromPath } = require('./server/configure.js')

const configPath = (args.config) ? args.config : path.join(__dirname, '..', 'config.js')

process.on('exit', (code) => {
  log.trace(code)
  log.log('Server is terminated with code ', code)
})

process.on('uncaughtException', function (err) {
  log.error('UncaughtException')
  log.error(err)
})

const _e = (error, callback = () => {}) => {
  log.error(error)
  callback(error)
}

class Index {
  defaultConfig () {
    return {
      common: {
        defaultClient: 'default'
      },
      webserver: {
        privateKey: './server.key',
        certificate: './server.crt',
        useSecure: false,
        address: 'localhost',
        port: '8080',
        expressExtraSetup: (expressApp) => {}
      }
    }
  }

  start () {
    var rawConfig = {}
    try {
      rawConfig = configureFromPath(configPath, this.defaultConfig())
    } catch (e) {
      _e(e, () => {
        log.error('Fail to load configuration:', configPath)
        process.exit(1)
      })
    }

    var config = {}
    const {
      common,
      ...rest
    } = rawConfig
    const mold = ['webserver', 'components', 'commander']
    for (const part of mold) {
      config[part] = Object.assign({}, common, rest[part])
      config[part].common = common
    }

    var Server = require('./server/server.js')
    Server.start(config).then(() => {
      log.info('Server started.')
    }).catch((r) => {
      _e(r, () => {
        log.error('Fail to prepare server.')
        process.exit(2)
      })
    })
  }
}

const app = new Index()
app.start()

/* if (module.exports) module.exports = Index */
