const { ComponentClass } = require('../../server/component-helper.js')
const FeedParser = require('feedparser')
const fetch = require('node-fetch')
const moment = require('moment')

var FeedUids = 1

const sort = (a, b) => {
  return (moment(a.date).isBefore(moment(b.date))) ? 1 : -1
}

class Feed {
  constructor (config) {
    if (!config.url) {
      console.warn('Feed has no valid url to scan:', config)
      return null
    }
    this.items = []
    this.meta = null
    this.maxItems = (config.maxItems) || 100
    this.scanInterval = (config.scanInterval) || 1000 * 60 * 60
    this.url = config.url
    this.uid = FeedUids++
    this.name = (config.name) || 'NONAME_FEED_' + this.uid
    this.className = (config.className) || null
    this.format = (typeof config.format === 'function')
      ? (item) => { return config.format(item) }
      : null
    this.timer = null
    this.continueScan()
  }

  continueScan () {
    clearTimeout(this.timer)
    this.work()
    this.timer = setTimeout(() => {
      this.continueScan()
    }, this.scanInterval)
  }

  stopScan () {
    clearTimeout(this.timer)
  }

  getItems () {
    return this.items
  }

  finishScan () {
    console.info(`Scan result: ${this.items.length} ${this.url}`)
    this.items.sort(sort)
    var ret = this.items.slice(0, this.maxItems)
    return ret
  }

  work () {
    console.info('Scanning feed:', this.url)
    this.items = []
    var fp = new FeedParser()
    fp.on('error', (err) => {
      console.warn('Feed parsing error\n', err.message)
    })
    fp.on('readable', () => {
      this.meta = fp.meta
      var item
      while ((item = fp.read())) {
        if (this.className) item.className = this.className
        if (typeof this.format === 'function') item = this.format(item)
        this.items.push(item)
      }
    })
    fp.on('end', () => {
      this.finishScan()
    })
    var req = fetch(this.url)
    req.then((res) => {
      if (res.status !== 200) {
        console.warn(`Invalid URL, This feed will be ignored: ${this.url}`)
        return
      }
      res.body.pipe(fp)
    }, (err) => {
      console.warn(`Error for feed scanning: ${this.url} : ${err.message}\nThis feed will be ignored.`)
    })
  }
}

module.exports = class extends ComponentClass {
  customElements () {
    return [
      'mz-feedreader'
    ]
  }

  getItems (source = null) {
    var items = []
    for (var feed of this.feeds) {
      if (!source || source.search(feed.name) > -1) {
        var fi = feed.getItems()
        items = items.concat(fi)
      }
    }
    items.sort(sort)
    return items
  }

  onClientMessage (mObj) {
    if (mObj.message && mObj.message.key === 'REQUEST_ITEM') {
      var items = this.getItems(mObj.message.source)
      return items
    }
  }

  onStart () {
    this.feeds = []
    const {
      maxItems = 100,
      scanInterval = 1000 * 60 * 60,
      feeds
    } = this.config
    for (const feed of feeds) {
      if (feed.url) {
        var f = new Feed(Object.assign({}, { maxItems, scanInterval }, feed))
        if (f) this.feeds.push(f)
      }
    }
  }
}
