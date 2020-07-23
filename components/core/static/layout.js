var layout = [
  {
    name: 'mz-clock',
    id: 'test1',
    config: {
      locale: 'ja-JP',
      timezone: 'Asia/Tokyo'
    },
    position: {
      layer: 'foreground'
    }
  },
  {
    name: 'mz-clock',
    id: 'test2',
    config: {
      dynamicsize: 8
    },
    position: {
      layer: 'foreground',
      column: 'full',
      row: '3 / 5'
    }
  },
  {
    name: 'mz-compliment',
    position: {
      layer: 'foreground',
      area: '-3 / full / -2 / full'
    }
  }
]

export default layout
