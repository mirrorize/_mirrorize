var layout = [
  {
    name: 'mz-clock',
    id: 'test1',
    config: {
      locale: 'ja-JP',
      timezone: 'Asia/Tokyo'
    },
    position: {
      target: '.foreground'
    }
  },
  {
    name: 'mz-clock',
    id: 'test2',
    position: {
      target: '.leftBox'
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
      target: '.leftBox'
    }
  }
]

export default layout
