/**
 * Create and export configuration variable
 * 
 */

// Container for all environments
let environments = {};

// Staging (default) environment
environments.staging = {
    envName: 'staging',
    httpPort: 3000,
    httpsPort: 3001,
    hashingSecret: 'ashjd#46$hdf',
    maxChecks: 5,
    twilio: {
        accountSid: 'ACb32d411ad7fe886aac54c665d25e5c5d',
        authToken: '9455e3eb3109edc12e3d8c92768f7a67',
        fromPhone: '+15005550006'

    }
};

// Production environment
environments.production = {
    envName: 'production',
    httpPort: 8080,
    httpsPort: 443,
    hashingSecret: 'ashjd#46$hdf',
    maxChecks: 5
};

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ?
    process.env.NODE_ENV.toLowerCase() : '';

const environmentToExport = 
    typeof(environments[currentEnvironment]) == 'object' ? 
    environments[currentEnvironment] : environments['staging'];

module.exports = environmentToExport;