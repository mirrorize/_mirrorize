const Log = require('./logger.js')('MESSENGER')
const mergeWith = require('lodash.mergewith')
const fs = require('fs')

function merge (...args) {
  return mergeWith(...args)
}

function override (...args) {
  const replacer = function (orig, src) {
    if (Array.isArray(src)) return src
    if (src === null) return null
    if (
      typeof src === 'object' &&
      Object.getOwnPropertyNames(src).length === 0
    ) return src
  }

  return mergeWith(...args, replacer)
}

function configureFromPath (filePath, defaultConfig = {}, toOverride = true) {
  if (!fs.existsSync(filePath)) return defaultConfig
  try {
    var config = require(filePath)
    return configure(config, defaultConfig, toOverride)
  } catch (e) {
    Log.warn(`Fail to require : ${filePath}`)
    Log.warn(e)
    return defaultConfig
  }
}

function configure (newConfig, defaultConfig = {}, toOverride = true) {
  if (toOverride) {
    return override(newConfig, defaultConfig)
  } else {
    return merge(newConfig, defaultConfig)
  }
}

module.exports = { configureFromPath, configure, merge, override }
