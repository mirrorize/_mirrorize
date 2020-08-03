const { ComponentClass } = require('../../server/component-helper.js')

class Compliment extends ComponentClass {
  onConstructed () {
    this.defaults = {
      conditions: {
        monday: () => {
          var d = new Date()
          if (d.getDay() === 1) return true
        },
        weekday: () => {
          const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          var d = new Date()
          if (d.getDay() !== 0 && d.getDay() !== 6) return dayOfWeek[d.getDay()]
        },
        evening: () => {
          var d = new Date()
          if (d.getHours() > 17 || d.getHours() < 6) {
            return true
          }
        }
      }
    }
    this.compliments = (this.config.compliments) ? this.config.compliments : {}
    this.conditions = (this.config.conditions) ? this.config.conditions : {}
    this.conditions = Object.assign({}, this.defaults.conditions, this.conditions)
  }

  onRequested (req, res) {
    var compliments = []
    if (this.compliments.common && Array.isArray(this.compliments.common)) {
      compliments = compliments.concat(this.compliments.common)
    }
    for (const [key, func] of Object.entries(this.conditions)) {
      if (typeof func === 'function') {
        var result = func()
        if (!result) continue
        if (Object.keys(this.compliments).includes(key)) {
          for (var str of this.compliments[key]) {
            str = str.replace('{{RETURN}}', result)
            compliments.push(str)
          }
        }
      }
    }
    var ret = ''
    if (compliments.length > 1) {
      ret = compliments[Math.floor(Math.random() * compliments.length)]
    }
    res.status(200).send(ret)
  }

  updateCompliment (key, compliments, conditions) {
    this.compliments[key] = compliments
    this.conditions[key] = conditions
  }
}

module.exports = Compliment
