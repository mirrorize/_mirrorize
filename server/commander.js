class _Commander {
  init (_config) {
    return new Promise((resolve) => {
      this.config = _config
      this.commands = []
      resolve()
    })
  }

  findCommand (command) {
    return this.commands.find((c) => {
      return (c.command === command)
    })
  }

  registerComponentCommand (components) {
    return new Promise((resolve, reject) => {
      try {
        for (const component of components) {
          if (typeof component.registerCommand === 'function') {
            var commands = component.registerCommand()
            commands.forEach((c, i) => {
              var command, callback, description, originalCommand, from
              from = component.id
              command = c.command
              if (typeof callback !== 'function') {
                callback = () => {}
              } else {
                callback = c.callback.bind(component)
              }
              originalCommand = command
              if (!description) description = ''
              var found
              while ((found = this.findCommand(command))) {
                var cString = found.command
                var cNumber = Number(cString.slice(
                  cString.indexOf(originalCommand) + originalCommand.length
                ))
                command = originalCommand + (cNumber + 1)
              }
              var cObj = { command, callback, description, originalCommand, from }
              this.commands.push(cObj)
            })
          } else {
            // console.log(component.registerCommand)
          }
          resolve()
        }
      } catch (e) {
        reject(e)
      }
    })
  }
}

const Commander = new _Commander()

module.exports = Commander
