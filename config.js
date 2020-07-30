var config = {
  common: {
    dev: false,
    logLevel: 0
  },
  webserver: {
    defaultClient: 'default',
    privateKey: './server.key',
    certificate: './server.crt',
    useSecure: false, // For 'https', set it as `true`
    // address: 'localhost', // or your domain/ip /* no need */
    port: '8081', // Your port
    expressExtraSetup: (expressApp) => {} // If you need additional setup of express.js. For example proxy setup.
    // expressExtraSetup: (app) => { app.set('trust proxy', 'loopback, 123.123.123.123') }
  }
}

if (typeof module !== 'undefined') module.exports = config
