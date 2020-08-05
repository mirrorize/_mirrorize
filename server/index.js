const path = require('path')
const args = require('yargs').argv
const configPath = (args.config) ? args.config : path.join(__dirname, '..', 'config.js')

process.on('exit', (code) => {
  console.trace(code)
  return console.log('Server is terminated with code ', code)
})

process.on('uncaughtException', function (err) {
  console.error('UncaughtException')
  console.error(err)
})

const _e = (error, callback = () => {}) => {
  console.error(error)
  callback(error)
}

var rawConfig = {}
try {
  rawConfig = require(configPath)
} catch (e) {
  _e(e, () => {
    console.error('Fail to load configuration:', configPath)
    process.exit(1)
  })
}

var config = {}
const { common, ...rest } = rawConfig
for (const part of Object.keys(rest)) {
  config[part] = Object.assign({}, common, rest[part])
}

var Server = require('./server.js')
Server.init(config)
  .then(() => {
    Server.start()
  })
  .catch((r) => {
    _e(r, () => {
      console.error('Fail to prepare server.')
      process.exit(2)
    })
  })

/*
const Components = require('server/components.js')
const WebServer = require('server/webserver.js')
const Commander = require('server/commander.js')
*/

/*
const afterSocketOpened = () => {

}

const receiveFrontStatus = (msg) => {
  const message = JSON.parse(msg)
  switch (message.message) {
    case 'SOCKET_OPENED':
      console.info('Client is connected.:', message.uid)
      afterSocketOpened()
      break
  }
}
*/
/*
const spawning = async () => {
  return new Promise((resolve) => {
    const child = spawn('npm', ['run', 'elec-start'])
    child.on('exit', (code) => {
      console.log(code)
    })
    child.on('error', (err) => {
      console.error('Failed to launch Electron.')
      throw err
    })
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
    resolve()
  })
}
*/
/*
const scenario = async () => {
  WebServer.start(Config.webserver, ()=>{})
  Components.init(Object.assign({}, Config.common, Config.components))
  Components.prepareComponent((component) => {
    WebServer.addComponentRoute(component)
    Commander.registerComponentCommand(component)
  })
  Components.start()
  // await spawning()
}

scenario()
*/
