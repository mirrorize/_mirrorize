
var config = {
  'mz-feedreader': {
    duration: 1000 * 10
  },
  component: {
    maxItems: 2,
    scanInterval: 1000 * 60 * 30,
    feeds: [
      {
        name: 'Reddit',
        url: 'https://www.reddit.com/r/news/.rss',
      },
      {
        name: 'Wall Street Journal',
        url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml'
      },
      {
        name: 'The Guardian',
        url: 'https://www.theguardian.com/world/rss'
      },
      {
        name: 'ESPN',
        url: 'https://www.espn.com/espn/rss/news'
      },
      {
        name: 'New York Times',
        url: 'https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/section/world/rss.xml',
        className: 'feedNYTimes',
        scanInterval: 1000 * 60 * 10,
        format: (item) => {
          return item // if null, delete this item
        }
      },

      {
        name: 'BBC England',
        url: 'http://feeds.bbci.co.uk/news/england/rss.xml'
      },

      {
        name: 'LifeHacker',
        url: 'https://lifehacker.com/rss'
      },

      {
        name: 'Joe Rogan',
        url: 'http://joeroganexp.joerogan.libsynpro.com/rss'
      },
      {
        name: 'Podcast1',
        url: 'https://feeds.megaphone.fm/WWO8086402096'
      },
      {
        name: 'R1619',
        url: 'https://rss.art19.com/1619'
      },
      {
        name: 'CNN',
        url: 'http://rss.cnn.com/rss/cnn_topstories.rss',
        format: (item) => {
          if (!item.date) return null // to remove advertise
          return item
        }
      }
    ]
  }
}

module.exports = config
