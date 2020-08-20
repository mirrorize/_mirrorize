const console = require('./logger.js')('TRANSLATE')
const fs = require('fs')
const path = require('path')

class _Translate {
  static factory (locale, sPath) {
    return new _Translate(locale, sPath)
  }

  constructor (locales = [], sPath, cName) {
    const env = process.env
    const sysLang = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES
    locales.push(sysLang)
    if (!fs.existsSync(sPath)) {
      console.error(`Invalid translation directory : ${sPath}`)
      return false
    }

    var availables = fs.readdirSync(sPath).filter((file) => {
      var filePath = path.join(sPath, file)
      if (fs.statSync(filePath).isDirectory()) return false
      if (path.extname(file) === '.json') return true
      return false
    })

    this.locale = this.findLocale(locales, availables)
    this.script = {}
    if (this.locale) {
      var scriptPath = path.join(sPath, this.locale + '.json')
      this.script = require(scriptPath)
    } else {
      console.warn(`Component '${cName}' has no proper translations:`, locales.toString(', '))
    }
  }

  _ (...args) {
    var fallback = null
    if (typeof args[args.length - 1] === 'function') {
      fallback = args.pop()
    }
    var key = args.shift()
    if (!fallback) fallback = key
    if (this.script[key]) return this.script[key]
    return fallback
  }

  getScript () {
    return this.script
  }

  getLocaleScript (locale) {

  }

  findLocale (locales, availables) {
    if (!Array.isArray(locales)) return false
    if (!Array.isArray(availables)) return false
    for (var locale of locales) {
      if (!locale) continue
      while (locale) {
        locale = locale.slice(0, -1)
        var termjs = locale + '.json'
        if (availables.find((js) => {
          return js.toLowerCase() === termjs.toLowerCase()
        })) return locale
      }
    }
    return false
  }
}

function Translate (...args) {
  return _Translate.factory(...args)
}

module.exports = Translate
