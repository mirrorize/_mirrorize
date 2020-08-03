var layout = [
  {
    name: 'mz-image',
    id: 'myImage',
    config: {
      src: 'https://a.espncdn.com/photo/2020/0727/r724202_608x342_16-9.jpg',
      fit: 'contain',
      bgglass: true
    },
    position: {
      target: '.background',
      area: '0 / full / -1 / full'
    }
  },
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
      target: '.main',
      area: '-3 / full / -2 / full'
    }
  },
  {
    name: 'mz-feedreader',
    position: {
      // target: '#bottom_right'
      target: '#feedPosition'
    }
  }
]

export default layout
