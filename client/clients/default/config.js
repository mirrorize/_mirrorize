const config = {
  common: {
    foo: 1,
    bar: 2,
    baz: 3,
    locale: 'ko-KR',
    timezone: 'Asia/Seoul',
  },
  foo: 'bar',
  locale: 'ko-KR',
  timezone: 'Asia/Seoul',
  customConfig: {
    'miniweather': {
      animation: {
        hide: {
          animation: {
            opacity: [1, 0],
          },
          timing: {
            duration: 1000,
            easing: 'ease-in-out'
          }
        },
        show: {
          animation: {
            opacity: [0, 1],
          },
          timing: {
            duration: 1000,
            easing: 'ease-in-out'
          }
        }
      }
    }
  }
}

export default config
