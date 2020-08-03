const config = {
  foo: 'bar',
  locale: 'ko-KR',
  timezone: 'Asia/Seoul',
  elements: [
    {
      name: 'mz-clock',
      target: '#top_left',
      class: 'clock1',
      attribute: {
        pages: 'page1, page2'
      }
    }
  ],
  customConfig: {
    'temp.1': {
      foo: 'overridden'
    }
  }
}

export default config
