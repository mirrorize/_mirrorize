'use strict'

const path = require('path')
const { spawn } = require('child_process')
const args = require('yargs').argv

const configPath = (args.config) ? args.config : path.join(__dirname, 'config.js')
var config = {}
try {
  config = require(configPath)
} catch (e) {
  console.error('Fail to find configuration.', configPath)
  process.exit()
}

if (Object.prototype.hasOwnProperty.call(config, 'server')) {
  console.log(config.server)
  const child = spawn('npm', ['run', 'server', configPath])
  child.on('exit', (code) => {
    console.info('Server is terminated.', code)
  })
  child.on('error', (err) => {
    console.error('Failed to launch Server.')
    console.error(err)
  })
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
}

if (Object.prototype.hasOwnProperty.call(config, 'client')) {
  console.log(config.client)
  const child = spawn('npm', ['run', 'client', configPath])
  child.on('exit', (code) => {
    console.info('Client is terminated.', code)
  })
  child.on('error', (err) => {
    console.error('Failed to launch Client.')
    console.error(err)
  })
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
}
