var config = {
  common: {
    dev: false,
    logLevel: 0,
    defaultClient: 'default',
    locale: 'en-US',
    language: 'en',
    timezone: 'Europe/Berlin',
    longitude: '38.000',
    lattitude: '38.000'
  },
  webserver: {
    privateKey: './server.key',
    certificate: './server.crt',
    useSecure: false, // For 'https', set it as `true`
    address: 'localhost',
    port: '8080', // Your port
    expressExtraSetup: (expressApp) => {} // If you need additional setup of express.js. For example proxy setup.
    // expressExtraSetup: (app) => { app.set('trust proxy', 'loopback, 123.123.123.123') }
  }
}

if (typeof module !== 'undefined') module.exports = config
