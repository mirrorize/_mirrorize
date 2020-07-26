var layout = [
  {
    name: 'mz-clock',
    id: 'test1',
    config: {
      locale: 'ja-JP',
      timezone: 'Asia/Tokyo'
    },
    position: {
      target: '#bottom_right'
    }
  },
  {
    name: 'mz-clock',
    id: 'test2',
    position: {
      target: '#bottom_right'
    }
  },
  {
    name: 'mz-compliment',
    position: {
      target: '.foreground',
      area: '-3 / full / -2 / full'
    }
  },
  {
    name: 'mz-feedreader',
    position: {
      target: '#bottom_right'
    }
  }
]

export default layout
