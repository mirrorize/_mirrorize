
var config = {
  'mz-compliment': {
    refresh: 60 * 1000
  },
  component: {
    compliments: {
      common: [
        '您好', 'Hola', 'Hello', 'السلام عليكم', 'नमस्ते', 'Oi', 'Olá', 'হ্যালো',
        'Здравствуйте', '今日は', 'Halo', '안녕하세요', 'Hallo', 'Bonjour',
        'నమస్కారం', 'Merhaba', 'chào bạn', 'வணக்க0', 'Ciao', 'درود', 'สวัสดี',
        'Cześć'
      ],
      monday: [
        "It's Monday",
        'New weeks start!'
      ],
      weekday: [
        "It's {{RETURN}}.",
        "Let's play!"
      ],
      weekends: [
        "It's {{RETURN}}.",
        "Let's study hard!"
      ],
      morning: ['Good morning!'],
      evening: ['Good evening!', 'Guten Abend!', '좋은 밤 되세요.']
    }
  }
}

module.exports = config
