const { ComponentClass, ComponentHelper } = require('../../server/component-helper.js')

module.exports = class extends ComponentClass {
  injectModuleScripts () {
    return [
      '/core/public/core.mjs'
    ]
  }

  injectStyles () {
    return [
      '/core/misc/fonts/fonts.css'
    ]
  }

  getStaticRoutes () {
    return ['/misc']
  }

  onStart () {
    this.sendMessage('COMPONENT', { foo: 1 }, (ret) => {
      console.log('msg replied:', ret)
    })
    this.sendMessage('COMPONENT(NAME:core)', { foo: 2 }, (ret) => {
      console.log('msg replied:', ret)
    })
  }

  onMessage (msgObj, reply) {
    console.log('Core get!', msgObj)
    reply({
      replied: true,
      payload: msgObj
    })
  }
}

// to = {
//
// }



// SERVER
// COMPONENT:*
// COMPONENT:core
// BROWSERUID:*
// BROWSERUID: default_12345
// BROWSERNAME:*
// BROWSERUID: default
// BROWSERX/ELEMENT:*
// BROWSERX/ELEMENTTAG:
