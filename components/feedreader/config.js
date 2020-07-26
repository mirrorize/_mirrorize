
var config = {
  'mz-feedreader': {
    duration: 1000 * 10
  },
  component: {
    maxItems: 100,
    scanInterval: 1000 * 60 * 30,
    feeds: [
      {
        name: 'New York Times',
        url: 'https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/section/world/rss.xml',
        className: 'feedNYTimes',
        scanInterval: 1000 * 60 * 10,
        format: (item) => {
          return item
        }
      },
      {
        name: 'The Guardian',
        url: 'https://www.theguardian.com/world/rss'
      }
    ]
  }
}

module.exports = config
