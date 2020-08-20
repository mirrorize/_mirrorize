class I18N {
  static factory (...locales) {
    return new I18N(locales)
  }

  constructor (...locales) {
    const env = process.env
    const sysLang = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES
    locales.push(sysLang)
    if (!this.setLocales(locales)) return false
  }

  setLocales (locales) {
    try {
      this.locales = Intl.getCanonicalLocales(locales)
    } catch (e) {
      console.error(e)
      return false
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
  dateTimeFormat (dateObj, options = {}) {
    if (typeof dateObj !== 'object' || dateObj.constructor !== 'Date') return dateObj.toString()
    return new Intl.DateTimeFormat(this.locales, options).format(dateObj)
  }

  listFormat (listArray, options = {}) {
    if (!Array.isArray(listArray)) return listArray.toString()
    return new Intl.ListFormat(this.locales, options).format(listArray)
  }

  numberFormat (number, options = {}) {
    if (!Number.isNumber(number)) return number.toString()
    return new Intl.NumberFormat(this.locales, options).format(number)
  }
}

(function (exports) {
  exports = function (...args) {
    return new I18N(...args)
  }
}(typeof module === 'undefined' ? this.I18N = {} : module.exports))

//
// const I18N = require('i18n-formatter')
// var i18n = I18N(aLocales).formatter(oFormatter).conditional(oConditional)
// var result = i18n.source('I have {{0}} apple{{0#s}}, {{1}} box{{1#es}} and {{2:myDecimal}} token{{2#es}}).args(1, 2, 1000).convert()
// //=> 'I have 1 apple, 2 boxes and 1,000 tokens.''
