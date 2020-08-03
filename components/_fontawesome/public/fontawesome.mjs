function applyFontAwesome (ce) {
  return new Promise((resolve, reject) => {
    var faStyle = [...document.styleSheets].find((sheet) => {
      return sheet.href && sheet.href.includes('fontawesome')
    })

    if (!faStyle) {
      console.warn('Cannot find fontawesome stylesheets')
      reject(new Error('No fontawesome stylesheet'))
    }
    var text = ''
    for (var rule of [...faStyle.cssRules]) {
      text += rule.cssText
    }
    ce.appendStyleText(text)
    resolve()
  })
}

export { applyFontAwesome }
