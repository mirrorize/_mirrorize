var config = {
  common: {
    dev: false,
    logLevel: 0,
    defaultClient: 'default'
  },
  webserver: {
    privateKey: './server.key',
    certificate: './server.crt',
    useSecure: false, // For 'https', set it as `true`
    // address: 'localhost', // or your domain/ip /* no need */
    port: '8080', // Your port
    expressExtraSetup: (expressApp) => {} // If you need additional setup of express.js. For example proxy setup.
    // expressExtraSetup: (app) => { app.set('trust proxy', 'loopback, 123.123.123.123') }
  },
  components: {
    foo: 'bar'
  }
}

if (typeof module !== 'undefined') module.exports = config
