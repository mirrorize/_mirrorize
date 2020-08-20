require('dotenv').config()
const chalk = require('chalk')
const log = require('loglevel')
const prefix = require('loglevel-plugin-prefix')

const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.white,
  INFO: chalk.green,
  WARN: chalk.yellow,
  ERROR: chalk.red
}

prefix.reg(log)

if (process.env.LOGLEVEL) {
  log.setDefaultLevel(process.env.LOGLEVEL)
  console.info(`Log level is set to ${process.env.LOGLEVEL}`)
}

prefix.apply(log, {
  format (level, name, timestamp) {
    // return `${chalk.gray(`[${timestamp}]`)} ${chalk.green(`${name}`)} > ${colors[level.toUpperCase()](level)}: `
    return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](`${name}`)}\t`
  }
})

function _log (name = null) {
  if (!name || !name.trim()) return log
  name = name.toUpperCase()
  if (name.length > 12) name = name.slice(0, 11) + '~'
  return log.getLogger(name)
}

module.exports = _log
